/**
 * Supabase PostGIS Mock Client and Geospatial API Wrapper
 * 
 * This file serves as a drop-in mock for the @supabase/supabase-js client
 * and provides simulated spatial queries using real coordinate-based math (Haversine
 * and Ray-Casting Point-in-Polygon checks) for Washington State geology data.
 * 
 * To switch to a real Supabase backend, configure your Supabase environment variables,
 * install @supabase/supabase-js, and modify this file to use the real Supabase client.
 */

// =========================================================================
// GEOSPATIAL HELPER UTILITIES
// =========================================================================

/**
 * Calculates the Haversine distance in meters between two coordinates.
 */
export function getHaversineDistance(lng1: number, lat1: number, lng2: number, lat2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Checks if a point (lng, lat) is inside a polygon using Ray-Casting.
 */
export function isPointInPolygon(lng: number, lat: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Checks if a polygon's bounding box intersects a bounding box.
 */
export function isPolygonIntersectBBox(
  poly: [number, number][],
  minLng: number,
  minLat: number,
  maxLng: number,
  maxLat: number
): boolean {
  let polyMinLng = Infinity;
  let polyMaxLng = -Infinity;
  let polyMinLat = Infinity;
  let polyMaxLat = -Infinity;

  for (const [lng, lat] of poly) {
    if (lng < polyMinLng) polyMinLng = lng;
    if (lng > polyMaxLng) polyMaxLng = lng;
    if (lat < polyMinLat) polyMinLat = lat;
    if (lat > polyMaxLat) polyMaxLat = lat;
  }

  return !(
    polyMaxLng < minLng ||
    polyMinLng > maxLng ||
    polyMaxLat < minLat ||
    polyMinLat > maxLat
  );
}

// =========================================================================
// MOCK GEOSPATIAL DATABASE (SEEDED REAL WASHINGTON DATA)
// =========================================================================

export interface GeologicUnit {
  id: string;
  name: string;
  lithology: string;
  age: string;
  description: string;
  polygon: [number, number][];
}

export interface PublicCollectionSite {
  id: string;
  name: string;
  material_types: string[];
  access_notes: string;
  difficulty: string;
  best_season: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface PaidDig {
  id: string;
  name: string;
  business_type: string;
  material_types: string[];
  price_text: string;
  booking_link: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface PublicAccessBoundary {
  id: string;
  owner_agency_type: string;
  description: string;
  multipolygon: [number, number][][];
}

export const mockGeologicUnits: GeologicUnit[] = [];

export const mockPublicCollectionSites: PublicCollectionSite[] = [];

export const mockPaidDigs: PaidDig[] = [];

export const mockPublicAccessBoundaries: PublicAccessBoundary[] = [];

// =========================================================================
// MOCK SUPABASE CLIENT IMPLEMENTATION
// =========================================================================

export const supabase = {
  /**
   * Mock Supabase Remote Procedure Call (RPC)
   */
  rpc: async (functionName: string, params: any = {}): Promise<{ data: any; error: any }> => {
    // Simulate short network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      switch (functionName) {
        case "get_geologic_unit_at": {
          const { lng, lat } = params;
          if (lng === undefined || lat === undefined) throw new Error("Missing parameters: lng, lat");
          const match = mockGeologicUnits.find((gu) => isPointInPolygon(lng, lat, gu.polygon));
          if (!match) return { data: null, error: null };
          return {
            data: {
              id: match.id,
              name: match.name,
              lithology: match.lithology,
              age: match.age,
              description: match.description,
              geom_geojson: JSON.stringify({
                type: "Polygon",
                coordinates: [match.polygon],
              }),
            },
            error: null,
          };
        }

        case "get_access_boundaries_at": {
          const { lng, lat } = params;
          if (lng === undefined || lat === undefined) throw new Error("Missing parameters: lng, lat");
          const matches = mockPublicAccessBoundaries.filter((pab) =>
            pab.multipolygon.some((poly) => isPointInPolygon(lng, lat, poly))
          );
          return {
            data: matches.map((match) => ({
              id: match.id,
              owner_agency_type: match.owner_agency_type,
              description: match.description,
              geom_geojson: JSON.stringify({
                type: "MultiPolygon",
                coordinates: match.multipolygon,
              }),
            })),
            error: null,
          };
        }

        case "get_sites_near": {
          const { lng, lat, radius_meters } = params;
          if (lng === undefined || lat === undefined || radius_meters === undefined) {
            throw new Error("Missing parameters: lng, lat, radius_meters");
          }
          const results = mockPublicCollectionSites
            .map((site) => {
              const dist = getHaversineDistance(lng, lat, site.coordinates[0], site.coordinates[1]);
              return { ...site, distance_meters: dist };
            })
            .filter((site) => site.distance_meters <= radius_meters)
            .sort((a, b) => a.distance_meters - b.distance_meters)
            .map((site) => ({
              id: site.id,
              name: site.name,
              material_types: site.material_types,
              access_notes: site.access_notes,
              difficulty: site.difficulty,
              best_season: site.best_season,
              distance_meters: site.distance_meters,
              geom_geojson: JSON.stringify({
                type: "Point",
                coordinates: site.coordinates,
              }),
            }));
          return { data: results, error: null };
        }

        case "get_digs_near": {
          const { lng, lat, radius_meters } = params;
          if (lng === undefined || lat === undefined || radius_meters === undefined) {
            throw new Error("Missing parameters: lng, lat, radius_meters");
          }
          const results = mockPaidDigs
            .map((dig) => {
              const dist = getHaversineDistance(lng, lat, dig.coordinates[0], dig.coordinates[1]);
              return { ...dig, distance_meters: dist };
            })
            .filter((dig) => dig.distance_meters <= radius_meters)
            .sort((a, b) => a.distance_meters - b.distance_meters)
            .map((dig) => ({
              id: dig.id,
              name: dig.name,
              business_type: dig.business_type,
              material_types: dig.material_types,
              price_text: dig.price_text,
              booking_link: dig.booking_link,
              distance_meters: dig.distance_meters,
              geom_geojson: JSON.stringify({
                type: "Point",
                coordinates: dig.coordinates,
              }),
            }));
          return { data: results, error: null };
        }

        case "get_sites_in_bbox": {
          const { min_lng, min_lat, max_lng, max_lat } = params;
          if (min_lng === undefined || min_lat === undefined || max_lng === undefined || max_lat === undefined) {
            throw new Error("Missing bounding box dimensions");
          }
          const results = mockPublicCollectionSites
            .filter((site) =>
              site.coordinates[0] >= min_lng &&
              site.coordinates[0] <= max_lng &&
              site.coordinates[1] >= min_lat &&
              site.coordinates[1] <= max_lat
            )
            .map((site) => ({
              id: site.id,
              name: site.name,
              material_types: site.material_types,
              access_notes: site.access_notes,
              difficulty: site.difficulty,
              best_season: site.best_season,
              geom_geojson: JSON.stringify({
                type: "Point",
                coordinates: site.coordinates,
              }),
            }));
          return { data: results, error: null };
        }

        case "get_digs_in_bbox": {
          const { min_lng, min_lat, max_lng, max_lat } = params;
          if (min_lng === undefined || min_lat === undefined || max_lng === undefined || max_lat === undefined) {
            throw new Error("Missing bounding box dimensions");
          }
          const results = mockPaidDigs
            .filter((dig) =>
              dig.coordinates[0] >= min_lng &&
              dig.coordinates[0] <= max_lng &&
              dig.coordinates[1] >= min_lat &&
              dig.coordinates[1] <= max_lat
            )
            .map((dig) => ({
              id: dig.id,
              name: dig.name,
              business_type: dig.business_type,
              material_types: dig.material_types,
              price_text: dig.price_text,
              booking_link: dig.booking_link,
              geom_geojson: JSON.stringify({
                type: "Point",
                coordinates: dig.coordinates,
              }),
            }));
          return { data: results, error: null };
        }

        case "get_geologic_units_in_bbox": {
          const { min_lng, min_lat, max_lng, max_lat } = params;
          if (min_lng === undefined || min_lat === undefined || max_lng === undefined || max_lat === undefined) {
            throw new Error("Missing bounding box dimensions");
          }
          const results = mockGeologicUnits
            .filter((gu) => isPolygonIntersectBBox(gu.polygon, min_lng, min_lat, max_lng, max_lat))
            .map((gu) => ({
              id: gu.id,
              name: gu.name,
              lithology: gu.lithology,
              age: gu.age,
              description: gu.description,
              geom_geojson: JSON.stringify({
                type: "Polygon",
                coordinates: [gu.polygon],
              }),
            }));
          return { data: results, error: null };
        }

        default:
          throw new Error(`RPC Function '${functionName}' not mocked.`);
      }
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  },

  /**
   * Mock Supabase table query client
   */
  from: (tableName: string) => {
    return {
      select: (_columns: string = "*") => {
        return {
          then: (resolve: (value: { data: any[]; error: any }) => void) => {
            let data: any[] = [];
            if (tableName === "geologic_units") {
              data = mockGeologicUnits.map((gu) => ({
                ...gu,
                geom: { type: "Polygon", coordinates: [gu.polygon] },
              }));
            } else if (tableName === "public_collection_sites") {
              data = mockPublicCollectionSites.map((site) => ({
                ...site,
                geom: { type: "Point", coordinates: site.coordinates },
              }));
            } else if (tableName === "paid_digs") {
              data = mockPaidDigs.map((dig) => ({
                ...dig,
                geom: { type: "Point", coordinates: dig.coordinates },
              }));
            } else if (tableName === "public_access_boundaries") {
              data = mockPublicAccessBoundaries.map((pab) => ({
                ...pab,
                geom: { type: "MultiPolygon", coordinates: pab.multipolygon },
              }));
            }
            resolve({ data, error: null });
          },
        };
      },
    };
  },
};

// =========================================================================
// HIGH-LEVEL GEOSPATIAL API WRAPPER
// =========================================================================

export const spatialApi = {
  /**
   * Finds the geologic unit containing a point.
   */
  getGeologicUnitAt: async (lng: number, lat: number) => {
    const { data, error } = await supabase.rpc("get_geologic_unit_at", { lng, lat });
    if (error) throw new Error(error);
    return data;
  },

  /**
   * Finds public access boundaries covering a point.
   */
  getAccessBoundariesAt: async (lng: number, lat: number) => {
    const { data, error } = await supabase.rpc("get_access_boundaries_at", { lng, lat });
    if (error) throw new Error(error);
    return data || [];
  },

  /**
   * Finds public sites near a point within a radius (default 50km).
   */
  getSitesNear: async (lng: number, lat: number, radiusMeters: number = 50000) => {
    const { data, error } = await supabase.rpc("get_sites_near", {
      lng,
      lat,
      radius_meters: radiusMeters,
    });
    if (error) throw new Error(error);
    return data || [];
  },

  /**
   * Finds paid digs near a point within a radius (default 50km).
   */
  getDigsNear: async (lng: number, lat: number, radiusMeters: number = 50000) => {
    const { data, error } = await supabase.rpc("get_digs_near", {
      lng,
      lat,
      radius_meters: radiusMeters,
    });
    if (error) throw new Error(error);
    return data || [];
  },

  /**
   * Finds public sites within a bounding box.
   */
  getSitesInBBox: async (minLng: number, minLat: number, maxLng: number, maxLat: number) => {
    const { data, error } = await supabase.rpc("get_sites_in_bbox", {
      min_lng: minLng,
      min_lat: minLat,
      max_lng: maxLng,
      max_lat: maxLat,
    });
    if (error) throw new Error(error);
    return data || [];
  },

  /**
   * Finds paid digs within a bounding box.
   */
  getDigsInBBox: async (minLng: number, minLat: number, maxLng: number, maxLat: number) => {
    const { data, error } = await supabase.rpc("get_digs_in_bbox", {
      min_lng: minLng,
      min_lat: minLat,
      max_lng: maxLng,
      max_lat: maxLat,
    });
    if (error) throw new Error(error);
    return data || [];
  },

  /**
   * Finds geologic units intersecting a bounding box.
   */
  getGeologicUnitsInBBox: async (minLng: number, minLat: number, maxLng: number, maxLat: number) => {
    const { data, error } = await supabase.rpc("get_geologic_units_in_bbox", {
      min_lng: minLng,
      min_lat: minLat,
      max_lng: maxLng,
      max_lat: maxLat,
    });
    if (error) throw new Error(error);
    return data || [];
  },
};
