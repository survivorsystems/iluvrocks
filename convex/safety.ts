import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const checkIn = mutation({
  args: {
    locationId: v.id("locations"),
    expectedReturnTime: v.number(),
    emergencyContact: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Close any existing active check-ins
    const active = await ctx.db
      .query("safetyCheckins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    for (const c of active) {
      await ctx.db.patch(c._id, { status: "returned" });
    }

    return await ctx.db.insert("safetyCheckins", {
      userId,
      locationId: args.locationId,
      checkInTime: Date.now(),
      expectedReturnTime: args.expectedReturnTime,
      emergencyContact: args.emergencyContact,
      status: "active",
      notes: args.notes,
    });
  },
});

export const checkOut = mutation({
  args: { checkinId: v.id("safetyCheckins") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    
    const checkin = await ctx.db.get(args.checkinId);
    if (!checkin || checkin.userId !== userId) throw new Error("Check-in not found");

    await ctx.db.patch(args.checkinId, { status: "returned" });
  },
});
