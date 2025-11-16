// Integration package for external APIs: postcode, school, and location services

import { LocationType, SchoolType } from "@schoolgle/shared";
import type {
  PostcodeData,
  SchoolSearchResult,
  Location,
  ApiResponse
} from "@schoolgle/shared";

// Postcode API Client
export class PostcodeAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = "https://api.postcodes.io") {
    this.baseUrl = baseUrl;
  }

  // Lookup postcode data
  async lookupPostcode(postcode: string): Promise<ApiResponse<PostcodeData>> {
    try {
      const cleanPostcode = postcode.replace(/\s/g, "");
      const response = await fetch(
        `${this.baseUrl}/postcodes/${cleanPostcode}`
      );

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch postcode data: ${response.statusText}`
        };
      }

      const data = await response.json();

      if (!data.result) {
        return {
          success: false,
          error: "Postcode not found"
        };
      }

      return {
        success: true,
        data: {
          postcode: data.result.postcode,
          latitude: data.result.latitude,
          longitude: data.result.longitude,
          region: data.result.region,
          district: data.result.admin_district,
          ward: data.result.admin_ward
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Get nearby postcodes
  async getNearbyPostcodes(
    postcode: string,
    limit: number = 10
  ): Promise<ApiResponse<PostcodeData[]>> {
    try {
      const cleanPostcode = postcode.replace(/\s/g, "");
      const response = await fetch(
        `${this.baseUrl}/postcodes/${cleanPostcode}/nearest?limit=${limit}`
      );

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch nearby postcodes: ${response.statusText}`
        };
      }

      const data = await response.json();

      const postcodes: PostcodeData[] = data.result.map((item: any) => ({
        postcode: item.postcode,
        latitude: item.latitude,
        longitude: item.longitude,
        region: item.region,
        district: item.admin_district,
        ward: item.admin_ward
      }));

      return {
        success: true,
        data: postcodes
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Reverse geocode (get postcode from coordinates)
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<ApiResponse<PostcodeData>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/postcodes?lon=${longitude}&lat=${latitude}&limit=1`
      );

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to reverse geocode: ${response.statusText}`
        };
      }

      const data = await response.json();

      if (!data.result || data.result.length === 0) {
        return {
          success: false,
          error: "No postcode found for coordinates"
        };
      }

      const result = data.result[0];

      return {
        success: true,
        data: {
          postcode: result.postcode,
          latitude: result.latitude,
          longitude: result.longitude,
          region: result.region,
          district: result.admin_district,
          ward: result.admin_ward
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}

// School API Client (placeholder for UK school data)
export class SchoolAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  // Search schools near postcode
  async searchSchoolsNearPostcode(
    postcode: string,
    radius: number = 5
  ): Promise<ApiResponse<SchoolSearchResult[]>> {
    // This is a placeholder implementation
    // In production, this would call a real UK schools API (e.g., Get Information About Schools)
    try {
      // For now, return mock data
      const mockSchools: SchoolSearchResult[] = [
        {
          name: "Demo Primary School",
          postcode: postcode,
          address: "123 School Lane",
          type: SchoolType.PRIMARY,
          distance: 0.5
        },
        {
          name: "Example Secondary Academy",
          postcode: postcode,
          address: "456 Education Road",
          type: SchoolType.SECONDARY,
          distance: 1.2
        }
      ];

      return {
        success: true,
        data: mockSchools,
        message: "Using mock data - connect to real API in production"
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Get school details by URN (Unique Reference Number)
  async getSchoolByURN(urn: string): Promise<ApiResponse<SchoolSearchResult>> {
    // Placeholder for real implementation
    return {
      success: false,
      error: "Not implemented - connect to real UK schools API"
    };
  }
}

// Places API Client (for safe locations like parks, libraries)
export class PlacesAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  // Find safe locations near coordinates
  async findSafeLocations(
    latitude: number,
    longitude: number,
    radius: number = 2000,
    types: LocationType[] = [
      LocationType.PARK,
      LocationType.LIBRARY,
      LocationType.PLAYGROUND
    ]
  ): Promise<ApiResponse<Location[]>> {
    // This is a placeholder implementation
    // In production, this would use OpenStreetMap Overpass API or similar
    try {
      // Mock data for now
      const mockLocations: Location[] = [
        {
          id: "loc-1",
          name: "Town Park",
          type: LocationType.PARK,
          latitude: latitude + 0.01,
          longitude: longitude + 0.01,
          postcode: "DEMO1",
          safetyRating: 9,
          description: "Large public park with play area"
        },
        {
          id: "loc-2",
          name: "Central Library",
          type: LocationType.LIBRARY,
          latitude: latitude - 0.01,
          longitude: longitude - 0.01,
          postcode: "DEMO2",
          safetyRating: 10,
          description: "Public library with children's section"
        },
        {
          id: "loc-3",
          name: "Adventure Playground",
          type: LocationType.PLAYGROUND,
          latitude: latitude + 0.005,
          longitude: longitude - 0.005,
          postcode: "DEMO3",
          safetyRating: 8,
          description: "Modern playground equipment"
        }
      ];

      // Filter by requested types
      const filtered = mockLocations.filter((loc) => types.includes(loc.type));

      return {
        success: true,
        data: filtered,
        message: "Using mock data - connect to OSM Overpass API in production"
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Query OpenStreetMap Overpass API (for production)
  async queryOverpassAPI(query: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
          method: "POST",
          body: query
        }
      );

      if (!response.ok) {
        return {
          success: false,
          error: `Overpass API error: ${response.statusText}`
        };
      }

      const data = await response.json();

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Fetch real buildings from OpenStreetMap
  async fetchRealBuildings(
    latitude: number,
    longitude: number,
    radius: number = 300
  ): Promise<ApiResponse<any[]>> {
    try {
      // Overpass QL query to get buildings within radius
      const query = `
        [out:json][timeout:25];
        (
          way["building"](around:${radius},${latitude},${longitude});
          relation["building"](around:${radius},${latitude},${longitude});
        );
        out body;
        >;
        out skel qt;
      `;

      const result = await this.queryOverpassAPI(query);

      if (!result.success || !result.data) {
        return result;
      }

      // Parse OSM data into building objects
      const elements = result.data.elements || [];
      const nodes = new Map();
      const buildings = [];

      // First pass: collect all nodes
      for (const element of elements) {
        if (element.type === "node") {
          nodes.set(element.id, { lat: element.lat, lon: element.lon });
        }
      }

      // Second pass: process buildings
      for (const element of elements) {
        if (element.type === "way" && element.tags && element.tags.building) {
          // Calculate building center from nodes
          const buildingNodes = element.nodes
            .map((nodeId: number) => nodes.get(nodeId))
            .filter((node: any) => node);

          if (buildingNodes.length === 0) continue;

          const avgLat =
            buildingNodes.reduce((sum: number, node: any) => sum + node.lat, 0) /
            buildingNodes.length;
          const avgLon =
            buildingNodes.reduce((sum: number, node: any) => sum + node.lon, 0) /
            buildingNodes.length;

          // Estimate building dimensions from bounding box
          const lats = buildingNodes.map((node: any) => node.lat);
          const lons = buildingNodes.map((node: any) => node.lon);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLon = Math.min(...lons);
          const maxLon = Math.max(...lons);

          // Convert lat/lon differences to approximate meters
          const width = GeoUtils.calculateDistance(avgLat, minLon, avgLat, maxLon) * 1000;
          const depth = GeoUtils.calculateDistance(minLat, avgLon, maxLat, avgLon) * 1000;

          buildings.push({
            id: `osm-${element.id}`,
            latitude: avgLat,
            longitude: avgLon,
            type: element.tags.building,
            amenity: element.tags.amenity || null,
            name: element.tags.name || null,
            levels: parseInt(element.tags["building:levels"] || "2"),
            height: parseFloat(element.tags.height || String(parseInt(element.tags["building:levels"] || "2") * 3)),
            width,
            depth,
            nodes: buildingNodes
          });
        }
      }

      return {
        success: true,
        data: buildings,
        message: `Found ${buildings.length} real buildings from OpenStreetMap`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}

// Distance calculation helper
export class GeoUtils {
  // Calculate distance between two coordinates using Haversine formula
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Check if coordinates are within UK bounds (approximate)
  static isWithinUK(latitude: number, longitude: number): boolean {
    return (
      latitude >= 49.9 &&
      latitude <= 60.9 &&
      longitude >= -8.2 &&
      longitude <= 1.8
    );
  }
}
