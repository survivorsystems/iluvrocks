import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Badge, Card, EmptyState, SectionHeader } from '../components/ui'

const reactions = [
  { type: 'nice_find', label: 'Nice Find', icon: '🪨' },
  { type: 'bucket_list', label: 'Bucket List', icon: '🔥' },
  { type: 'great_photo', label: 'Great Photo', icon: '📸' },
  { type: 'rare_material', label: 'Rare Material', icon: '💎' },
  { type: 'collection_goal', label: 'Collection Goal', icon: '🏆' },
]

export default function SpecimenDetail() {
  const { specimenId } = useParams()
  const detail = useQuery(
    api.collections.getDetail,
    specimenId ? { id: specimenId as Id<'collectionItems'> } : 'skip',
  )
  const toggleReaction = useMutation(api.collections.toggleReaction)

  if (!specimenId) {
    return (
      <EmptyState
        title="Find not found"
        description="This collection item link is missing an ID."
      />
    )
  }

  if (detail === undefined) {
    return <EmptyState title="Loading find..." />
  }

  if (!detail) {
    return (
      <EmptyState
        title="Find not found"
        description="This collection item may have been removed."
      />
    )
  }

  const { item, collector, reactionCounts, viewerReactions } = detail

  const handleReaction = async (reactionType: string) => {
    await toggleReaction({ collectionItemId: item._id, reactionType })
  }

  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Collection detail"
        title={item.specimenName}
        description="A closer look at this piece from the collection showcase."
        action={<Badge tone="neutral">{formatStatus(item.status)}</Badge>}
      />

      <div className="specimen-detail-grid">
        <Card className="specimen-photo-card">
          <img src={item.photoUrl} alt="" />
        </Card>
        <Card className="specimen-info-card">
          <dl className="specimen-detail-list">
            <div>
              <dt>Material type</dt>
              <dd>{item.materialType || 'Not added yet'}</dd>
            </div>
            <div>
              <dt>Found location</dt>
              <dd>{item.foundLocation || 'Not shared'}</dd>
            </div>
            <div>
              <dt>Date found</dt>
              <dd>
                {item.dateFound
                  ? new Date(item.dateFound).toLocaleDateString()
                  : 'Not added yet'}
              </dd>
            </div>
            <div>
              <dt>Acquisition</dt>
              <dd>{formatStatus(item.acquisitionType)}</dd>
            </div>
            <div>
              <dt>Collector</dt>
              <dd>
                {collector?.username ? (
                  <Link to={`/profile/${collector.username}`}>
                    {collector.name || collector.username}
                  </Link>
                ) : (
                  collector?.name || 'Rockhound member'
                )}
              </dd>
            </div>
          </dl>
          {item.notes ? <p className="specimen-notes">{item.notes}</p> : null}
        </Card>
      </div>

      <Card className="reaction-panel">
        <h2>Collector reactions</h2>
        <div className="reaction-grid">
          {reactions.map((reaction) => {
            const isActive = viewerReactions.includes(reaction.type)
            return (
              <button
                key={reaction.type}
                type="button"
                className={isActive ? 'is-active' : undefined}
                onClick={() => void handleReaction(reaction.type)}
              >
                <span aria-hidden="true">{reaction.icon}</span>
                <strong>{reaction.label}</strong>
                <em>{reactionCounts[reaction.type] ?? 0}</em>
              </button>
            )
          })}
        </div>
      </Card>
    </section>
  )
}

function formatStatus(value: string) {
  return value.replace(/_/g, ' ')
}
