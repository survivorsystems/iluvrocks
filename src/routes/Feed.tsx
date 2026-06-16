import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import CreatePost from '../components/CreatePost'
import PostCard from '../components/PostCard'

export default function Feed() {
  const posts = useQuery(api.social.listFeed, { limit: 20 })

  return (
    <section className="page-grid">
      <aside className="rail">
        <p className="eyebrow">RockHound feed</p>
        <h1>Fresh from the field</h1>
        <p>Browse recent finds and notes from the community.</p>
      </aside>
      <div className="feed-column">
        <CreatePost />
        {posts === undefined ? <p className="empty-state">Loading feed...</p> : null}
        {posts?.length === 0 ? <p className="empty-state">No posts yet.</p> : null}
        {posts?.map((post) => <PostCard key={post._id} post={post} />)}
      </div>
    </section>
  )
}
