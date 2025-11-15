import { NextRequest, NextResponse } from "next/server";
import { PostcodeAPIClient } from "@schoolgle/integration";
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

    // Generate school layout using the WorldGenerator
    const layout = WorldGenerator.generateSchoolLayout(postcode);

    // Create dummy buildings based on generated layout
    const buildings: Building[] = [];
    const seed = WorldGenerator.generateSeed(postcode);

    // Main building (always present)
    buildings.push({
      id: "building-main",
      type: BuildingType.MAIN_BUILDING,
      position: { x: 0, y: 3, z: 0 },
      size: { x: 8, y: 6, z: 10 },
      color: "#C8B4A0"
    });

    // Generate additional buildings based on buildingCount
    const buildingTypes = [
      BuildingType.CLASSROOM,
      BuildingType.LIBRARY,
      BuildingType.GYM,
      BuildingType.CAFETERIA,
      BuildingType.OFFICE
    ];

    for (let i = 1; i < layout.buildingCount; i++) {
      const random1 = WorldGenerator.seededRandom(seed + i);
      const random2 = WorldGenerator.seededRandom(seed + i + 100);
      const random3 = WorldGenerator.seededRandom(seed + i + 200);

      const x = (random1 - 0.5) * 30; // Spread across 30 units
      const z = (random2 - 0.5) * 30;
      const buildingType =
        buildingTypes[Math.floor(random3 * buildingTypes.length)];

      buildings.push({
        id: `building-${i}`,
        type: buildingType,
        position: { x, y: 2, z },
        size: { x: 4 + random1 * 2, y: 3 + random2 * 2, z: 4 + random3 * 2 },
        color: `hsl(${random1 * 360}, 40%, 60%)`
      });
    }

    // Create terrain data
    const terrain: TerrainData = {
      size: {
        x: layout.terrainSize,
        y: 0,
        z: layout.terrainSize
      }
    };

    // Generate dummy creatures (we'll use these later)
    const creatures: Creature[] = [];
    const creatureTypes: CreatureType[] = [
      CreatureType.HR,
      CreatureType.FINANCE,
      CreatureType.ESTATES,
      CreatureType.GDPR
    ];

    for (let i = 0; i < layout.creatureCount; i++) {
      const random = WorldGenerator.seededRandom(seed + i + 500);
      const creatureType =
        creatureTypes[Math.floor(random * creatureTypes.length)];

      creatures.push({
        id: `creature-${i}`,
        name: `${creatureType} Guardian`,
        type: creatureType,
        level: 1,
        health: 100,
        maxHealth: 100,
        attack: 15,
        defense: 10,
        abilities: []
      });
    }

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
        postcodeData,
        layout
      },
      message: `Generated world for ${postcodeData.postcode} (${postcodeData.region})`
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
