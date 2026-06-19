import { Link, useParams } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  Badge,
  Card,
  EmptyState,
  SectionHeader,
  getInitials,
} from '../components/ui'

export default function PublicCollection() {
  const { handle = '' } = useParams()
  const collection = useQuery(api.collections.listPublicByUsername, {
    username: handle,
  })

  if (collection === undefined) {
    return <EmptyState title="Loading collection..." />
  }

  if (!collection) {
    return (
      <EmptyState
        title="Collection not found"
        description="That rockhound profile could not be found."
      />
    )
  }

  const ownerName =
    collection.owner.name || collection.owner.username || 'Rockhound member'

  if (collection.isBlocked) {
    return (
      <EmptyState
        title="Collection unavailable"
        description="This collection is not available because of a block setting."
      />
    )
  }

  if (collection.isPrivate) {
    return (
      <section className="workspace-page">
        <SectionHeader
          eyebrow="Public collection"
          title={`${ownerName}'s collection`}
          description="This rockhound has set their collection to private."
          action={<Badge tone="neutral">Private</Badge>}
        />
        <EmptyState
          title="Private collection"
          description="Only the owner can view these specimens right now."
        />
      </section>
    )
  }

  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Public collection"
        title={`${ownerName}'s collection`}
        description={`${collection.count} specimen${collection.count === 1 ? '' : 's'} shared with the iluvrocks community.`}
        action={<Badge tone="neutral">Public</Badge>}
      />

      <Card className="public-collection-owner">
        <div className="avatar" aria-hidden="true">
          {collection.owner.image ? (
            <img src={collection.owner.image} alt="" />
          ) : (
            getInitials(ownerName)
          )}
        </div>
        <div>
          <p className="eyebrow">@{collection.owner.username}</p>
          <h2>{ownerName}</h2>
        </div>
      </Card>

      {collection.catalogs.length ? (
        <section className="catalog-section">
          <div className="catalog-grid">
            {collection.catalogs.map((catalog) => (
              <Card key={catalog._id} className="catalog-card">
                <h2>{catalog.name}</h2>
                <p>{catalog.description || 'Catalog details coming soon.'}</p>
                <span>Folder</span>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {collection.items.length === 0 ? (
        <EmptyState
          title="No public specimens yet"
          description="Collection photos will appear here once this member uploads them."
        />
      ) : (
        <div className="collection-grid">
          {collection.items.map((item) => (
            <Link
              key={item._id}
              to={`/collections/${item._id}`}
              className="collection-card-link"
            >
              <Card as="article" className="collection-card">
                <img src={item.photoUrl} alt="" />
                <div>
                  <h2>{item.specimenName}</h2>
                  <p>
                    {item.materialType ||
                      item.foundLocation ||
                      'Specimen details coming soon'}
                  </p>
                  <span>{item.status.replace(/_/g, ' ')}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
