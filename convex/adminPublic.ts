import { query } from './_generated/server'

export const getSiteAppearance = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('siteAppearance')
      .withIndex('by_key', (q) => q.eq('key', 'default'))
      .unique()
  },
})

export const listPublishedResources = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('resourceLibraryItems')
      .withIndex('by_status', (q) => q.eq('status', 'published'))
      .collect()
  },
})
