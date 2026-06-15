import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { getAuthUserId } from "@convex-dev/auth/server";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const identifyMineral = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) throw new Error("Image not found");

    const { text } = await generateText({
      model: openrouter("google/gemini-2.0-flash-001"),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Identify the rock or mineral in this image. Provide the name, a brief geological description, and common locations in Washington State where it might be found. Keep it concise and formatted for a hobbyist rockhound." },
            { type: "image", image: imageUrl },
          ],
        },
      ],
    });

    await ctx.runMutation(internal.ai.saveIdentification, {
      userId,
      storageId: args.storageId,
      result: text,
    });

    return text;
  },
});

export const saveIdentification = internalMutation({
  args: {
    userId: v.id("users"),
    storageId: v.id("_storage"),
    result: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("identifications", {
      userId: args.userId,
      storageId: args.storageId,
      result: args.result,
    });
  },
});

export const getMyIdentifications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const idents = await ctx.db
      .query("identifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return await Promise.all(
      idents.map(async (id) => ({
        ...id,
        imageUrl: await ctx.storage.getUrl(id.storageId),
      }))
    );
  },
});
