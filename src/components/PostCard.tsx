import { Heart, MapPin, MessageCircle } from 'lucide-react'
import { useMutation } from 'convex/react'
import { Link } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import type { Doc, Id } from '../../convex/_generated/dataModel'
import { useAuthProfileState } from '../lib/authState'

type FeedPost = Doc<'posts'> & {
  author?: {
    name?: string
    username?: string
    image?: string
  }
  locationName?: string
  isLiked?: boolean
}

type PostCardProps = {
  post: FeedPost
}

const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(timestamp))

export default function PostCard({ post }: PostCardProps) {
  const toggleLike = useMutation(api.social.toggleLike)
  const auth = useAuthProfileState()

  const handleLike = async () => {
    if (!auth.isAuthenticated) return

    try {
      await toggleLike({ postId: post._id as Id<'posts'> })
    } catch (error) {
      console.warn('Like requires sign-in', error)
    }
  }

  return (
    <article className="post-card">
      <div className="post-header">
        <div className="avatar" aria-hidden="true">
          {post.author?.image ? <img src={post.author.image} alt="" /> : initials(post.author?.name)}
        </div>
        <div>
          <p className="post-author">{post.author?.name || 'RockHound member'}</p>
          <p className="post-meta">
            @{post.author?.username || 'rockhound'} · {formatDate(post._creationTime)}
          </p>
        </div>
      </div>
      <div className="post-body">
        {post.title ? <h2>{post.title}</h2> : null}
        <p>{post.content}</p>
        {post.locationName ? (
          <p className="location-line">
            <MapPin aria-hidden="true" />
            {post.locationName}
          </p>
        ) : null}
        {post.tags?.length ? (
          <div className="tag-row">
            {post.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        ) : null}
      </div>
      <footer className="post-actions">
        {auth.isAuthenticated ? (
          <button type="button" onClick={handleLike} className={post.isLiked ? 'is-liked' : ''}>
            <Heart aria-hidden="true" />
            {post.likeCount || 0}
          </button>
        ) : (
          <Link to="/login">
            <Heart aria-hidden="true" />
            Create your Basecamp to like
          </Link>
        )}
        <span>
          <MessageCircle aria-hidden="true" />
          {post.commentCount || 0}
        </span>
      </footer>
    </article>
  )
}

function initials(name?: string) {
  if (!name) return 'RA'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
