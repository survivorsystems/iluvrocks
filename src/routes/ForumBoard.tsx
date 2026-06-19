import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { MessageSquare, Send } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Card, EmptyState, SectionHeader, getInitials } from '../components/ui'
import { useAuthProfileState } from '../lib/authState'

export default function ForumBoard() {
  const { forumSlug = '' } = useParams()
  const auth = useAuthProfileState()
  const forum = useQuery(api.chat.getForum, { forumSlug })
  const posts = useQuery(api.chat.listForumPosts, { forumSlug })
  const createPost = useMutation(api.chat.createForumPost)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    setIsPosting(true)
    try {
      await createPost({ forumSlug, title, body })
      setTitle('')
      setBody('')
      setStatus('Posted to the forum.')
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Forum post could not be created.',
      )
    } finally {
      setIsPosting(false)
    }
  }

  if (forum === undefined) return <EmptyState title="Loading forum..." />
  if (!forum) {
    return (
      <section className="workspace-page">
        <EmptyState
          title="Forum not found"
          description="That community board does not exist yet."
        />
      </section>
    )
  }

  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow={forum.sectionTitle}
        title={forum.title}
        description={forum.description}
        action={
          <Link to="/community" className="secondary-action">
            All forums
          </Link>
        }
      />

      <Card className="forum-composer-card">
        <form onSubmit={handleSubmit}>
          <h2>Start a forum post</h2>
          <p>
            Posts here stay inside this forum and do not appear on the public
            discovery feed.
          </p>
          {auth.isAuthenticated ? (
            <>
              <label>
                Title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="What do you want to talk about?"
                  required
                />
              </label>
              <label>
                Post
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  rows={4}
                  placeholder="Share details, photos coming later, questions, or field notes."
                  required
                />
              </label>
              <div className="form-footer">
                <span>{status}</span>
                <button
                  type="submit"
                  disabled={isPosting || !title.trim() || !body.trim()}
                >
                  <Send aria-hidden="true" />
                  {isPosting ? 'Posting...' : 'Post to forum'}
                </button>
              </div>
            </>
          ) : (
            <div className="forum-auth-note">
              <p>
                Sign in to post or comment. You can still read the forums while
                browsing.
              </p>
              <Link to="/login" className="primary-action">
                Sign in
              </Link>
            </div>
          )}
        </form>
      </Card>

      {posts === undefined ? <EmptyState title="Loading posts..." /> : null}
      {posts?.length === 0 ? (
        <EmptyState
          title="No posts here yet"
          description="Be the first to start this forum board."
        />
      ) : null}
      <div className="forum-post-list">
        {posts?.map((post) => (
          <ForumPostCard
            key={post._id}
            post={post}
            canComment={auth.isAuthenticated}
          />
        ))}
      </div>
    </section>
  )
}

function ForumPostCard({
  post,
  canComment,
}: {
  post: {
    _id: Id<'forumPosts'>
    title: string
    body: string
    createdAt: number
    commentCount?: number
    author?: {
      name?: string
      username?: string
      image?: string
    }
  }
  canComment: boolean
}) {
  const comments = useQuery(api.chat.listForumComments, { postId: post._id })
  const addComment = useMutation(api.chat.addForumComment)
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  const authorName =
    post.author?.name || post.author?.username || 'Rockhound member'

  const handleComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    try {
      await addComment({ postId: post._id, body: comment })
      setComment('')
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Comment could not be posted.',
      )
    }
  }

  return (
    <Card as="article" className="forum-post-card">
      <header>
        <div className="forum-avatar" aria-hidden="true">
          {post.author?.image ? (
            <img src={post.author.image} alt="" />
          ) : (
            getInitials(authorName)
          )}
        </div>
        <div>
          <p className="eyebrow">{authorName}</p>
          <h2>{post.title}</h2>
          <span>{new Date(post.createdAt).toLocaleString()}</span>
        </div>
      </header>
      <p>{post.body}</p>
      <div className="forum-comment-count">
        <MessageSquare aria-hidden="true" />
        <span>{post.commentCount ?? 0} comments</span>
      </div>

      <div className="forum-comments">
        {comments?.map((forumComment) => {
          const commentAuthor =
            forumComment.author?.name ||
            forumComment.author?.username ||
            'Rockhound member'
          return (
            <article key={forumComment._id}>
              <strong>{commentAuthor}</strong>
              <p>{forumComment.body}</p>
              <span>{new Date(forumComment.createdAt).toLocaleString()}</span>
            </article>
          )
        })}
      </div>

      {canComment ? (
        <form className="forum-comment-form" onSubmit={handleComment}>
          <label>
            <span className="sr-only">Comment</span>
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Add a comment..."
            />
          </label>
          <button type="submit" disabled={!comment.trim()}>
            Comment
          </button>
          {status ? <span>{status}</span> : null}
        </form>
      ) : (
        <p className="forum-auth-note">Sign in to comment.</p>
      )}
    </Card>
  )
}
