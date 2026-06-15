import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const seedCentralWA = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const centralWALocations = [
      {
        name: "Red Top Mountain",
        state: "Washington",
        region: "Central Washington",
        county: "Kittitas",
        description: "The most famous rockhounding destination near Ellensburg. Famous for Ellensburg Blue agates, clear quartz crystals, and scanning views of the Cascades.",
        coordinates: { lat: 47.2882, lng: -120.7583 },
        difficulty: 3,
        familyFriendly: true,
        roadAccessibility: 3,
        accessType: "Moderate Hike",
        landStatus: "Public (USFS)",
        permitRequired: false,
        permitInfo: "Northwest Forest Pass required for parking at the trailhead.",
        bestSeasons: ["Summer", "Fall"],
        typicalFinds: ["Ellensburg Blue Agate", "Agate", "Chalcedony", "Quartz"],
        directions: "From Cle Elum, follow Hwy 970 and Hwy 97 north toward Blewett Pass. Turn left onto Forest Road 9738 and follow signs to the Red Top Lookout trailhead.",
        parkingInfo: "USFS Trailhead parking. Can be crowded on summer weekends.",
        photos: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000"]
      },
      {
        name: "Yakima River Canyon",
        state: "Washington",
        region: "Central Washington",
        county: "Kittitas",
        description: "Spectacular river canyon known for gravel bars that yield agates, jasper, and petrified wood. Best searched when water levels are low.",
        coordinates: { lat: 46.8122, lng: -120.4658 },
        difficulty: 1,
        familyFriendly: true,
        roadAccessibility: 5,
        accessType: "Roadside",
        landStatus: "Public (BLM/WDFW)",
        permitRequired: true,
        permitInfo: "Discover Pass required for WDFW access sites.",
        bestSeasons: ["Spring", "Fall", "Winter"],
        typicalFinds: ["Agate", "Jasper", "Petrified Wood"],
        directions: "Located between Ellensburg and Yakima along Hwy 821 (Canyon Road). Multiple pull-offs and recreation areas provide access.",
        parkingInfo: "Designated BLM and state recreation parking lots.",
        photos: ["https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1000"]
      },
      {
        name: "Teanaway Area",
        state: "Washington",
        region: "Central Washington",
        county: "Kittitas",
        description: "A scenic region encompassing Blue Creek and diverse terrain. Known for high-quality quartz crystals and various agates.",
        coordinates: { lat: 47.2798, lng: -120.8953 },
        difficulty: 3,
        familyFriendly: true,
        roadAccessibility: 3,
        accessType: "Moderate Hike",
        landStatus: "Public (State/USFS)",
        permitRequired: true,
        permitInfo: "Discover Pass or NW Forest Pass depending on specific trailhead.",
        bestSeasons: ["Summer", "Fall"],
        typicalFinds: ["Agate", "Chalcedony", "Quartz crystals"],
        directions: "Follow Teanaway Road north from Hwy 970 near Cle Elum. Explore various forest roads leading into the Teanaway Community Forest.",
        parkingInfo: "Various pull-offs and trailhead lots.",
        photos: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000"]
      },
      {
        name: "First Creek Trail",
        state: "Washington",
        region: "Central Washington",
        county: "Kittitas",
        description: "A popular trail for crystal hunters. Offers opportunities to find various minerals in a forest setting.",
        coordinates: { lat: 47.3323, lng: -120.6552 },
        difficulty: 3,
        familyFriendly: true,
        roadAccessibility: 4,
        accessType: "Moderate Hike",
        landStatus: "Public (USFS)",
        permitRequired: false,
        bestSeasons: ["Summer", "Fall"],
        typicalFinds: ["Crystals", "Quartz", "Various Minerals"],
        directions: "Accessed via Highway 97 near Blewett Pass. Follow Forest Road 9716 to the trailhead.",
        photos: ["https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=1000"]
      },
      {
        name: "Lion Rock",
        state: "Washington",
        region: "Central Washington",
        county: "Kittitas",
        description: "High elevation backcountry prospecting area with panoramic views. Known for mineral collecting and diverse geological formations.",
        coordinates: { lat: 47.2536, lng: -120.6033 },
        difficulty: 4,
        familyFriendly: false,
        roadAccessibility: 2,
        accessType: "Long Hike",
        landStatus: "Public (USFS)",
        permitRequired: false,
        bestSeasons: ["Late Summer", "Early Fall"],
        typicalFinds: ["Minerals", "Jasper", "Agate"],
        directions: "A long drive on rough forest roads (FR 35) from Ellensburg or Table Mountain. High clearance vehicle recommended.",
        photos: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000"]
      },
      {
        name: "Dry Creek",
        state: "Washington",
        region: "Central Washington",
        county: "Kittitas",
        description: "A classic location for hunting the prized Ellensburg Blue agate. Focus on surface collecting in public access areas.",
        coordinates: { lat: 47.1254, lng: -120.6725 },
        difficulty: 2,
        familyFriendly: true,
        roadAccessibility: 4,
        accessType: "Short Walk",
        landStatus: "Public/Private Mix",
        permitRequired: false,
        permitInfo: "Be extremely careful to stay on public land. Much of the area is private property.",
        bestSeasons: ["Spring", "Fall"],
        typicalFinds: ["Ellensburg Blue Agate"],
        directions: "Northwest of Ellensburg. Access points are found along Reecer Creek and Dry Creek roads.",
        photos: ["https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=1000"]
      },
      {
        name: "Horse Canyon Road",
        state: "Washington",
        region: "Central Washington",
        county: "Kittitas",
        description: "Publicly accessible areas along the road where lucky collectors occasionally find Ellensburg Blue material.",
        coordinates: { lat: 47.1523, lng: -120.7852 },
        difficulty: 1,
        familyFriendly: true,
        roadAccessibility: 5,
        accessType: "Roadside",
        landStatus: "Public (BLM/County)",
        permitRequired: false,
        bestSeasons: ["Spring", "Fall"],
        typicalFinds: ["Ellensburg Blue Agate", "Agate"],
        directions: "Drive West from Ellensburg toward the hills. Multiple public access points exist along the road shoulders.",
        photos: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000"]
      },
      {
        name: "Ginkgo Petrified Forest",
        state: "Washington",
        region: "Central Washington",
        county: "Kittitas",
        description: "Iconic geological destination featuring a state park museum and trails through ancient lava flows and petrified logs. NOTE: Collecting within the State Park is strictly prohibited.",
        coordinates: { lat: 46.9458, lng: -119.9922 },
        difficulty: 1,
        familyFriendly: true,
        roadAccessibility: 5,
        accessType: "Short Walk",
        landStatus: "State Park",
        permitRequired: true,
        permitInfo: "Discover Pass required for vehicle access. NO COLLECTING ALLOWED.",
        bestSeasons: ["Year Round"],
        typicalFinds: ["Petrified Wood", "Washington Geology"],
        directions: "Located at Vantage, WA right off Interstate 90 on the Columbia River.",
        photos: ["https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1000"]
      },
      {
        name: "Saddle Mountains",
        state: "Washington",
        region: "Central Washington",
        county: "Grant",
        description: "Legendary destination for high-quality petrified wood and agatized logs. A vast area with multiple collecting pits.",
        coordinates: { lat: 46.7915, lng: -119.3458 },
        difficulty: 2,
        familyFriendly: true,
        roadAccessibility: 3,
        accessType: "Short Walk",
        landStatus: "Public (BLM)",
        permitRequired: false,
        permitInfo: "BLM regulations allow for small-scale personal collecting (up to 25lbs per day).",
        bestSeasons: ["Spring", "Fall", "Winter"],
        typicalFinds: ["Petrified Wood", "Agatized Wood", "Jasper", "Quartz"],
        directions: "South of Mattawa, WA. Accessed via various gravel roads leading up into the mountains from Hwy 24.",
        parkingInfo: "Dirt pull-offs and clearing. High clearance vehicle recommended for some tracks.",
        photos: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000"]
      }
    ];

    for (const location of centralWALocations) {
      const existing = await ctx.db
        .query("locations")
        .withIndex("by_state", (q) => q.eq("state", "Washington"))
        .filter((q) => q.eq(q.field("name"), location.name))
        .first();

      if (!existing) {
        await ctx.db.insert("locations", {
          ...location,
          numVisits: 0,
          numFinds: 0,
          numTripLogs: 0,
          avgDifficulty: location.difficulty,
          avgAccess: location.roadAccessibility,
        });
      }
    }
    return null;
  }
});
