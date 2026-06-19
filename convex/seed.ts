import { internalMutation } from './_generated/server'
import { v } from 'convex/values'

export const seedSocial = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if groups already exist
    const existingGroups = await ctx.db.query('groups').collect()
    if (existingGroups.length > 0) return

    // Create Groups
    const groups = [
      {
        name: 'Washington Agate Hunters',
        description:
          'Sharing the best gravel bars and beach spots for agates in WA.',
        slug: 'wa-agates',
        region: 'Washington',
      },
      {
        name: 'Oregon Coast Rockhounds',
        description:
          'Exploring the rugged Oregon coast for jaspers, agates, and fossils.',
        slug: 'or-coast',
        region: 'Oregon',
      },
      {
        name: 'Texas Fossil Hunters',
        description: 'Hunting for cretaceous fossils in the heart of Texas.',
        slug: 'tx-fossils',
        region: 'Texas',
      },
      {
        name: 'Jade Collectors',
        description: 'For enthusiasts of Nephrite and Jadeite finds.',
        slug: 'jade-collectors',
      },
      {
        name: 'Petrified Wood Enthusiasts',
        description: 'Collecting ancient forests from around the world.',
        slug: 'petrified-wood',
      },
    ]

    for (const group of groups) {
      await ctx.db.insert('groups', { ...group, memberCount: 0 })
    }

    // Create some initial users if they don't exist (assuming some might exist from previous seeds)
    // For a real seed, we'd need user IDs.
    // Since we're in a local dev env, we can just assume the viewer will create content.
  },
})
