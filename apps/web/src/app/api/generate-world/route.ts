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
    const placesClient = new PlacesAPIClient();
    const buildingsResult = await placesClient.fetchRealBuildings(
      centerLat,
      centerLon,
      300 // 300m radius
    );

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
          color: getBuildingColor(buildingType, osmBuilding.type)
        });
      }

      console.log(`Converted ${buildings.length} real OSM buildings to 3D world`);
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

    // Generate creatures (placeholder for now)
    const creatures: Creature[] = [];
    // TODO: Add creature placement logic based on building types

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
        ? `Generated world with ${buildings.length} real buildings from ${postcodeData.postcode} (${postcodeData.region})`
        : `Generated world for ${postcodeData.postcode} (${postcodeData.region}) - using fallback`
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
