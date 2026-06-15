import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedRegionalRooms = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const chatRooms = [
      { name: "Olympic Peninsula", slug: "olympic-peninsula", description: "Discussions about Neah Bay, Ozette, and the North Coast.", icon: "waves" },
      { name: "Puget Sound", slug: "puget-sound", description: "Olympia area, islands, and mainland beachcombing.", icon: "anchor" },
      { name: "Cascades", slug: "cascades", description: "Mountain Loop, North Cascades, and high-country hunting.", icon: "mountain" },
      { name: "Central Washington", slug: "central-wa", description: "Ellensburg Blue agates, petrified wood, and high desert finds.", icon: "sun" },
    ];

    for (const room of chatRooms) {
      const existing = await ctx.db
        .query("chatRooms")
        .withIndex("by_slug", (q) => q.eq("slug", room.slug))
        .first();
      if (!existing) {
        await ctx.db.insert("chatRooms", room);
      }
    }

    return null;
  },
});
