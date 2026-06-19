import { query } from './_generated/server'

export const listPublishedResources = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('resourceLibraryItems')
      .withIndex('by_status', (q) => q.eq('status', 'published'))
      .collect()
  },
})
