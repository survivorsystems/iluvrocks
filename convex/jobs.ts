import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", args.status || "active"))
      .order("desc")
      .collect();

    return await Promise.all(
      jobs.map(async (job) => {
        const user = await ctx.db.get(job.userId);
        return { ...job, postedBy: user?.name };
      })
    );
  },
});

export const postJob = mutation({
  args: {
    title: v.string(),
    company: v.string(),
    description: v.string(),
    location: v.string(),
    salaryRange: v.optional(v.string()),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    return await ctx.db.insert("jobs", {
      ...args,
      userId,
      status: "active",
    });
  },
});
