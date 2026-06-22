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

// Geologic Units Polygons (Closed loops)
const COLUMBIA_RIVER_BASALT_POLY: [number, number][] = [
  [-121.0, 45.8],
  [-121.0, 48.0],
  [-118.0, 48.0],
  [-118.0, 45.8],
  [-121.0, 45.8],
];

const CASCADE_VOLCANIC_POLY: [number, number][] = [
  [-122.2, 45.6],
  [-122.2, 49.0],
  [-121.0, 49.0],
  [-121.0, 45.6],
  [-122.2, 45.6],
];

const OLYMPIC_SUBDUCTION_POLY: [number, number][] = [
  [-124.6, 46.9],
  [-124.6, 48.4],
  [-123.0, 48.4],
  [-123.0, 46.9],
  [-124.6, 46.9],
];

export const mockGeologicUnits: GeologicUnit[] = [
  {
    id: "gu-columbia-basalt",
    name: "Columbia River Basalt Group",
    lithology: "Basaltic lava flows, vesicular and columnar jointed",
    age: "Miocene (15-17 Ma)",
    description: "Extensive basaltic flows covering central and eastern Washington. Known for hosting agates, jaspers, and petrified wood within cavities, vesicles, and pillow-basalt sedimentary interbeds.",
    polygon: COLUMBIA_RIVER_BASALT_POLY,
  },
  {
    id: "gu-cascade-arc",
    name: "Cascade Volcanic Arc (Cenozoic)",
    lithology: "Andesite, dacite, tuff, and volcanic breccia",
    age: "Eocene to Holocene",
    description: "Mountainous volcanic chain stretching North-South through Washington. Active hydrothermal systems have precipitated high-quality quartz crystals, amethyst scepters, chalcedony, and opal in fault fractures.",
    polygon: CASCADE_VOLCANIC_POLY,
  },
  {
    id: "gu-olympic-subduction",
    name: "Olympic Subduction Complex",
    lithology: "Sandstone, siltstone, turbidites, and tectonic melange with chert lenses",
    age: "Eocene to Miocene",
    description: "Accretionary wedge sediments uplifted to form the Olympic Mountains. Famous for marine fossils, orbicular jaspers, and iron-rich cherts in river gravels and coastal beaches.",
    polygon: OLYMPIC_SUBDUCTION_POLY,
  }
];

export const mockPublicCollectionSites: PublicCollectionSite[] = [
  {
    id: "site-damon-point",
    name: "Damon Point",
    material_types: ["Agate", "Jasper", "Carnelian", "Petrified Wood"],
    access_notes: "Easy walking access along the sandy spit. Best hunting is on the gravel bars exposed during low tide, particularly after major winter storms. No fee or special permits required.",
    difficulty: "Easy",
    best_season: "Winter & Fall",
    coordinates: [-124.15, 46.94],
  },
  {
    id: "site-saddle-mountain",
    name: "Saddle Mountain Recreation Area",
    material_types: ["Petrified Wood", "Opalized Wood"],
    access_notes: "A designated BLM rockhounding area. A rugged dirt road leads to the ridge; 4WD or high clearance is highly recommended. Personal collection is limited to 250 lbs per person per year. No fee.",
    difficulty: "Medium",
    best_season: "Spring & Autumn",
    coordinates: [-119.98, 46.80],
  },
  {
    id: "site-first-creek",
    name: "First Creek (Liberty Blue)",
    material_types: ["Blue Agate", "Jasper", "Geodes"],
    access_notes: "Located in the historic Liberty Mining District on USFS land. Steep, mountainous terrain. Watch out for active mining claims in the surrounding area; collect only on unclaimed, public Forest Service land.",
    difficulty: "Hard",
    best_season: "Summer & Fall",
    coordinates: [-120.65, 47.25],
  },
  {
    id: "site-hansen-creek",
    name: "Hansen Creek Quartz Location",
    material_types: ["Quartz Crystals", "Amethyst", "Scepter Quartz"],
    access_notes: "A world-famous crystal digging location on the slopes of Humpback Mountain. Located on USFS land. Involves a moderate but steep hike from the parking area. Hand tools only.",
    difficulty: "Hard",
    best_season: "Summer & Fall",
    coordinates: [-121.52, 47.38],
  },
  {
    id: "site-red-top",
    name: "Red Top Mountain designated rockhounding area",
    material_types: ["Agate", "Geodes", "Jasper"],
    access_notes: "Designated collecting area managed by the Okanogan-Wenatchee National Forest. Hand tools only. Agate-filled geodes occur in clay layers. Beautiful panoramic views. Forest roads are usually snowed-in until late June.",
    difficulty: "Medium",
    best_season: "Summer & Fall",
    coordinates: [-120.61, 47.32],
  }
];

export const mockPaidDigs: PaidDig[] = [
  {
    id: "dig-stonerose",
    name: "Stonerose Fossil Center",
    business_type: "Public Fossil Dig",
    material_types: ["Eocene Plant Fossils", "Insect Fossils", "Fish Fossils"],
    price_text: "$15 for adults, $10 for children. Includes admission to the museum and fossil site, plus tool rental (hammer and chisel). Users are allowed to keep up to 3 fossils per day under scientific review.",
    booking_link: "https://stonerosefossil.org",
    coordinates: [-118.73, 48.64],
  },
  {
    id: "dig-columbia-basin",
    name: "Columbia Basin Agates (Fee Dig)",
    business_type: "Private Fee Dig",
    material_types: ["Agate", "Jasper", "Petrified Wood"],
    price_text: "$25 entry fee per vehicle, plus $2 per pound for any material taken. Access to private ranches containing undisturbed Miocene gravel beds. Tools available for rent. Appointment required.",
    booking_link: "https://example.com/columbia-basin-digs",
    coordinates: [-119.55, 46.95],
  }
];

export const mockPublicAccessBoundaries: PublicAccessBoundary[] = [
  {
    id: "pab-blm-saddle",
    owner_agency_type: "BLM",
    description: "Bureau of Land Management (Saddle Mountain District). Multi-use public land generally open to personal-use mineral collecting up to 250 pounds per year without fee.",
    multipolygon: [
      [
        [-120.1, 46.75],
        [-120.1, 46.85],
        [-119.9, 46.85],
        [-119.9, 46.75],
        [-120.1, 46.75],
      ],
    ],
  },
  {
    id: "pab-usfs-mbs",
    owner_agency_type: "USFS",
    description: "Mount Baker-Snoqualmie National Forest. Managed by the US Forest Service. Recreational panning and mineral collection of rock/mineral specimens with hand tools is permitted under general forest rules.",
    multipolygon: [
      [
        [-121.6, 47.3],
        [-121.6, 47.5],
        [-121.4, 47.5],
        [-121.4, 47.3],
        [-121.6, 47.3],
      ],
    ],
  },
  {
    id: "pab-usfs-own",
    owner_agency_type: "USFS",
    description: "Okanogan-Wenatchee National Forest. Managed by the US Forest Service. Contains designated rockhounding zones and historic mining districts. Personal, non-commercial collecting is permitted.",
    multipolygon: [
      [
        [-120.8, 47.2],
        [-120.8, 47.4],
        [-120.4, 47.4],
        [-120.4, 47.2],
        [-120.8, 47.2],
      ],
    ],
  }
];

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
