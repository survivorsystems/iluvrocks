import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import CreatePost from '../components/CreatePost'
import PostCard from '../components/PostCard'
import { EmptyState, SectionHeader } from '../components/ui'

export default function Feed() {
  const posts = useQuery(api.social.listFeed, { limit: 20 })

  return (
    <section className="page-grid">
      <aside className="rail">
        <SectionHeader
          eyebrow="RockHound feed"
          title="Fresh from the field"
          description="Browse recent finds and notes from the community."
        />
      </aside>
      <div className="feed-column">
        <CreatePost />
        {posts === undefined ? <EmptyState title="Loading feed..." /> : null}
        {posts?.length === 0 ? <EmptyState title="No posts yet" description="Field notes will appear here as members start posting." /> : null}
        {posts?.map((post) => <PostCard key={post._id} post={post} />)}
      </div>
    </section>
  )
}
