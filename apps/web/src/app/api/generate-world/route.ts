import { NextRequest, NextResponse } from "next/server";
import { PostcodeAPIClient, PlacesAPIClient, GeoUtils } from "@schoolgle/integration";
import { WorldGenerator } from "@schoolgle/game-logic";
import { BuildingType, CreatureType } from "@schoolgle/shared";
import type {
  WorldData,
  Building,
  TerrainData,
  Vector3,
  Creature
} from "@schoolgle/shared";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postcode } = body;

    if (!postcode || typeof postcode !== "string") {
      return NextResponse.json(
        { success: false, error: "Postcode is required" },
        { status: 400 }
      );
    }

    // Call the Postcodes.io API to get location data
    const postcodeClient = new PostcodeAPIClient();
    const postcodeResult = await postcodeClient.lookupPostcode(postcode);

    if (!postcodeResult.success || !postcodeResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: postcodeResult.error || "Failed to lookup postcode"
        },
        { status: 404 }
      );
    }

    const postcodeData = postcodeResult.data;
    const centerLat = postcodeData.latitude;
    const centerLon = postcodeData.longitude;

    // Fetch real buildings from OpenStreetMap
    console.log(`Fetching real buildings from OSM for ${centerLat}, ${centerLon}`);
    const placesClient = new PlacesAPIClient();
    const buildingsResult = await placesClient.fetchRealBuildings(
      centerLat,
      centerLon,
      500 // Increased to 500m radius for more buildings
    );

    console.log(`OSM fetch result:`, {
      success: buildingsResult.success,
      buildingCount: buildingsResult.data?.length || 0,
      message: buildingsResult.message,
      error: buildingsResult.error
    });

    const buildings: Building[] = [];

    if (buildingsResult.success && buildingsResult.data && buildingsResult.data.length > 0) {
      // Convert real OSM buildings to 3D world coordinates
      const osmBuildings = buildingsResult.data;

      // Helper function to convert lat/lon to local x/z coordinates
      const latLonToLocal = (lat: number, lon: number) => {
        // Calculate distance from center in meters
        const dx = GeoUtils.calculateDistance(centerLat, centerLon, centerLat, lon) * 1000;
        const dz = GeoUtils.calculateDistance(centerLat, centerLon, lat, centerLon) * 1000;

        // Apply sign based on direction
        const x = lon > centerLon ? dx : -dx;
        const z = lat > centerLat ? -dz : dz; // Invert Z for typical 3D coordinate system

        return { x, z };
      };

      // Map OSM building types to our BuildingType enum
      const mapBuildingType = (osmType: string, amenity: string | null): BuildingType => {
        if (amenity === "school" || osmType === "school") return BuildingType.MAIN_BUILDING;
        if (amenity === "library" || osmType === "library") return BuildingType.LIBRARY;
        if (amenity === "gym" || osmType === "gym" || osmType === "sports_hall") return BuildingType.GYM;
        if (amenity === "cafe" || amenity === "restaurant" || osmType === "cafe") return BuildingType.CAFETERIA;
        if (osmType === "office" || osmType === "commercial") return BuildingType.OFFICE;
        if (osmType === "residential" || osmType === "house" || osmType === "apartments") return BuildingType.CLASSROOM;
        return BuildingType.MAIN_BUILDING;
      };

      // Map building type to color
      const getBuildingColor = (buildingType: BuildingType, osmType: string): string => {
        const colorMap: Record<BuildingType, string> = {
          [BuildingType.MAIN_BUILDING]: "#C8B4A0",
          [BuildingType.CLASSROOM]: "#E8D4C0",
          [BuildingType.LIBRARY]: "#A0B4C8",
          [BuildingType.GYM]: "#C0E8D4",
          [BuildingType.CAFETERIA]: "#E8C0D4",
          [BuildingType.OFFICE]: "#D4C0E8"
        };

        return colorMap[buildingType] || "#B0B0B0";
      };

      // Convert OSM buildings to our Building format
      for (const osmBuilding of osmBuildings.slice(0, 50)) { // Limit to 50 buildings for performance
        const { x, z } = latLonToLocal(osmBuilding.latitude, osmBuilding.longitude);

        // Constrain to reasonable building sizes for Minecraft-style world
        const width = Math.max(3, Math.min(osmBuilding.width || 10, 30));
        const depth = Math.max(3, Math.min(osmBuilding.depth || 10, 30));
        const height = Math.max(3, Math.min(osmBuilding.height || 6, 50));

        const buildingType = mapBuildingType(osmBuilding.type, osmBuilding.amenity);

        buildings.push({
          id: osmBuilding.id,
          type: buildingType,
          position: { x, y: height / 2, z },
          size: { x: width, y: height, z: depth },
          color: getBuildingColor(buildingType, osmBuilding.type),
          name: osmBuilding.name || undefined,
          amenity: osmBuilding.amenity || undefined,
          osmData: osmBuilding // Store for school identification
        } as any);
      }

      console.log(`Converted ${buildings.length} real OSM buildings to 3D world`);

      // Identify the main school building
      let mainSchool: Building | null = null;
      let minDistance = Infinity;

      for (const building of buildings) {
        const osmData = (building as any).osmData;
        if (!osmData) continue;

        // Check if this is a school
        const isSchool =
          osmData.amenity === "school" ||
          osmData.amenity === "kindergarten" ||
          osmData.amenity === "college" ||
          osmData.amenity === "university" ||
          osmData.type === "school" ||
          (osmData.name && osmData.name.toLowerCase().includes("school"));

        if (isSchool) {
          // Calculate distance from postcode center
          const distance = Math.sqrt(
            building.position.x * building.position.x +
            building.position.z * building.position.z
          );

          if (distance < minDistance) {
            minDistance = distance;
            mainSchool = building;
          }
        }
      }

      // Mark the main school
      if (mainSchool) {
        mainSchool.isMainSchool = true;
        // Give it a distinctive color
        mainSchool.color = "#FFD700"; // Gold color for the school
        console.log(`Identified main school: ${mainSchool.name || "Unnamed School"} at distance ${Math.round(minDistance)}m`);
      } else {
        console.log("No school building found in OSM data - using nearest large building as fallback");
        // Fallback: mark the largest building near center as "school"
        if (buildings.length > 0) {
          const sortedBySize = [...buildings].sort((a, b) =>
            (b.size.x * b.size.z) - (a.size.x * a.size.z)
          );
          mainSchool = sortedBySize[0];
          mainSchool.isMainSchool = true;
          mainSchool.name = mainSchool.name || "Local Building (Your School)";
          mainSchool.color = "#FFD700";
        }
      }

      // Clean up temporary osmData
      buildings.forEach(b => delete (b as any).osmData);
    } else {
      // Fallback: create a simple placeholder building if OSM fetch failed
      console.log("OSM fetch failed, using fallback building");
      buildings.push({
        id: "fallback-building",
        type: BuildingType.MAIN_BUILDING,
        position: { x: 0, y: 3, z: 0 },
        size: { x: 8, y: 6, z: 10 },
        color: "#C8B4A0"
      });
    }

    // Create terrain data (larger for real buildings)
    const terrain: TerrainData = {
      size: {
        x: 600, // 600m x 600m area
        y: 0,
        z: 600
      }
    };

    // Generate creatures based on building types
    const creatures: Creature[] = [];
    const creatureTypeMap: Record<BuildingType, CreatureType> = {
      [BuildingType.MAIN_BUILDING]: CreatureType.TEACHING,
      [BuildingType.CLASSROOM]: CreatureType.TEACHING,
      [BuildingType.LIBRARY]: CreatureType.TEACHING,
      [BuildingType.GYM]: CreatureType.SEND,
      [BuildingType.CAFETERIA]: CreatureType.FINANCE,
      [BuildingType.OFFICE]: CreatureType.HR
    };

    // Spawn one creature per building (or every other building for performance)
    buildings.forEach((building, index) => {
      if (index % 2 === 0 && creatures.length < 25) { // Limit to 25 creatures
        const creatureType = creatureTypeMap[building.type] || CreatureType.TEACHING;

        // Position creature near the building
        const offsetX = (Math.random() - 0.5) * 10;
        const offsetZ = (Math.random() - 0.5) * 10;

        creatures.push({
          id: `creature-${building.id}`,
          name: `${creatureType} Guardian`,
          type: creatureType,
          level: 1,
          health: 100,
          maxHealth: 100,
          attack: 15,
          defense: 10,
          abilities: [],
          position: {
            x: building.position.x + offsetX,
            y: 2, // Ground level + creature height
            z: building.position.z + offsetZ
          }
        });
      }
    });

    console.log(`Spawned ${creatures.length} creatures in the world`);

    // Construct the world data response
    const worldData: WorldData = {
      id: `world-${Date.now()}`,
      schoolId: `school-${postcodeData.postcode}`,
      postcode: postcodeData.postcode,
      buildings,
      terrain,
      creatures,
      generatedAt: new Date()
    };

    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        worldData,
        postcodeData
      },
      message: buildingsResult.success && buildingsResult.data && buildingsResult.data.length > 0
        ? `✓ Loaded ${buildings.length} real buildings from OpenStreetMap around ${postcodeData.postcode} (${postcodeData.region})`
        : `⚠️ OpenStreetMap data unavailable for ${postcodeData.postcode}. Using demo building. Try a different UK postcode with more buildings (e.g., "M1 1AD" Manchester, "SW1A 1AA" London).`
    });
  } catch (error) {
    console.error("Error generating world:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
