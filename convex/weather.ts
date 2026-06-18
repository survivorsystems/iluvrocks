import { action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const syncWeather = action({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    const location = await ctx.runQuery(internal.weather.getLocationForWeather, { id: args.locationId });
    if (!location) return;

    const { lat, lng } = location.coordinates;
    
    // Fetch from Open-Meteo (Free, no API key required)
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=precipitation_probability`
    );
    
    if (!response.ok) return;
    const data = await response.json();
    const current = data.current_weather;

    // Determine impact note based on weather
    let impactNote = "Conditions are stable for rockhounding.";
    if (current.weathercode >= 51) {
      impactNote = "Rain detected. Surface minerals like jasper and agate will be easier to spot, but watch for slippery rocks.";
    } else if (current.temperature > 85) {
      impactNote = "High heat alert. Bring extra water and avoid steep exposed slopes during peak sun.";
    } else if (current.windspeed > 20) {
      impactNote = "High winds. Be cautious of falling branches in forested areas.";
    }

    await ctx.runMutation(internal.weather.updateWeatherCache, {
      locationId: args.locationId,
      temp: current.temperature,
      precipitation: current.weathercode >= 51 ? "Rainy" : "Clear",
      wind: `${current.windspeed}km/h`,
      summary: `Weather Code: ${current.weathercode}`,
      impactNote,
    });
  },
});

export const getLocationForWeather = internalQuery({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateWeatherCache = internalMutation({
  args: {
    locationId: v.id("locations"),
    temp: v.number(),
    precipitation: v.string(),
    wind: v.string(),
    summary: v.string(),
    impactNote: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("weatherCache")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("weatherCache", {
        ...args,
        updatedAt: Date.now(),
      });
    }
  },
});
