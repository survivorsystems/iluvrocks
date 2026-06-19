import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Camera, FolderPlus, Lock, Unlock, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Badge, Card, EmptyState, SectionHeader } from '../components/ui'

export default function CollectionTracker() {
  const collection = useQuery(api.collections.listMine, {})
  const createItem = useMutation(api.collections.createItem)
  const createCatalog = useMutation(api.collections.createCatalog)
  const setVisibility = useMutation(api.collections.setVisibility)
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl)
  const [catalogName, setCatalogName] = useState('')
  const [catalogDescription, setCatalogDescription] = useState('')
  const [specimenName, setSpecimenName] = useState('')
  const [materialType, setMaterialType] = useState('')
  const [foundLocation, setFoundLocation] = useState('')
  const [dateFound, setDateFound] = useState('')
  const [status, setStatus] = useState('in_collection')
  const [acquisitionType, setAcquisitionType] = useState('found')
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [catalogMessage, setCatalogMessage] = useState<string | null>(null)
  const [visibilityMessage, setVisibilityMessage] = useState<string | null>(
    null,
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isCatalogSaving, setIsCatalogSaving] = useState(false)

  const usageText = collection
    ? `${collection.count} / ${collection.limit} Specimens Used`
    : 'Loading collection usage...'
  const isAtLimit = collection?.isAtLimit ?? false
  const previewUrl = useMemo(
    () => (photo ? URL.createObjectURL(photo) : null),
    [photo],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)

    if (isAtLimit) {
      setMessage("You've reached the free collection limit.")
      return
    }

    if (!photo) {
      setMessage('Add a specimen photo before saving.')
      return
    }

    setIsSaving(true)

    try {
      const storageId = await uploadFile(photo, generateUploadUrl)
      await createItem({
        specimenName: specimenName.trim(),
        materialType: emptyToUndefined(materialType),
        foundLocation: emptyToUndefined(foundLocation),
        dateFound: dateFound
          ? new Date(`${dateFound}T00:00:00`).getTime()
          : undefined,
        notes: emptyToUndefined(notes),
        status,
        acquisitionType,
        storageId,
      })
      setSpecimenName('')
      setMaterialType('')
      setFoundLocation('')
      setDateFound('')
      setStatus('in_collection')
      setAcquisitionType('found')
      setNotes('')
      setPhoto(null)
      setMessage('Specimen added to your collection.')
    } catch (error) {
      const detail = error instanceof Error ? error.message : ''
      setMessage(
        detail.includes('COLLECTION_LIMIT_REACHED')
          ? "You've reached the free collection limit."
          : detail.includes('Unauthorized')
            ? 'Sign in before adding collection photos.'
            : 'Collection item could not be saved.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleVisibilityChange = async (visibility: 'public' | 'private') => {
    setVisibilityMessage(null)
    try {
      await setVisibility({ visibility })
      setVisibilityMessage(
        visibility === 'public'
          ? 'Your collection is public.'
          : 'Your collection is private.',
      )
    } catch (error) {
      setVisibilityMessage(
        error instanceof Error
          ? error.message
          : 'Collection visibility could not be updated.',
      )
    }
  }

  const handleCatalogSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCatalogMessage(null)

    if (!catalogName.trim()) {
      setCatalogMessage('Add a catalog name first.')
      return
    }

    setIsCatalogSaving(true)
    try {
      await createCatalog({
        name: catalogName.trim(),
        description: emptyToUndefined(catalogDescription),
      })
      setCatalogName('')
      setCatalogDescription('')
      setCatalogMessage('Catalog created.')
    } catch (error) {
      setCatalogMessage(
        error instanceof Error
          ? error.message
          : 'Catalog could not be created.',
      )
    } finally {
      setIsCatalogSaving(false)
    }
  }

  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Collection showcase"
        title="Show off the keepers"
        description="Upload specimens, build your gallery, and give other collectors something to react to."
        action={
          <Badge tone={isAtLimit ? 'achievement' : 'neutral'}>
            {usageText}
          </Badge>
        }
      />

      <Card className="collection-settings-card">
        <div>
          <p className="eyebrow">Collection privacy</p>
          <h2>
            {collection?.visibility === 'private'
              ? 'Private collection'
              : 'Public collection'}
          </h2>
          <p>
            Public collections can be viewed from your profile. Private
            collections stay visible only to you.
          </p>
          {visibilityMessage ? <span>{visibilityMessage}</span> : null}
        </div>
        <div
          className="privacy-toggle"
          role="group"
          aria-label="Collection visibility"
        >
          <button
            type="button"
            className={
              collection?.visibility !== 'private' ? 'is-active' : undefined
            }
            onClick={() => void handleVisibilityChange('public')}
          >
            <Unlock aria-hidden="true" />
            Public
          </button>
          <button
            type="button"
            className={
              collection?.visibility === 'private' ? 'is-active' : undefined
            }
            onClick={() => void handleVisibilityChange('private')}
          >
            <Lock aria-hidden="true" />
            Private
          </button>
        </div>
      </Card>

      <Card>
        <form className="catalog-form" onSubmit={handleCatalogSubmit}>
          <div>
            <p className="eyebrow">Collection catalogs</p>
            <h2>Organize by folder</h2>
            <p>
              Create empty catalogs now, then we can add specimen sorting later.
            </p>
          </div>
          <label>
            Catalog name
            <input
              value={catalogName}
              onChange={(event) => setCatalogName(event.target.value)}
              placeholder="Agate"
            />
          </label>
          <label>
            Notes
            <input
              value={catalogDescription}
              onChange={(event) => setCatalogDescription(event.target.value)}
              placeholder="Washington agates, beach agates, favorites..."
            />
          </label>
          <div className="form-footer">
            <span>{catalogMessage}</span>
            <button
              type="submit"
              disabled={isCatalogSaving || !catalogName.trim()}
            >
              <FolderPlus aria-hidden="true" />
              {isCatalogSaving ? 'Creating...' : 'Create catalog'}
            </button>
          </div>
        </form>
      </Card>

      {collection?.catalogs.length ? (
        <div className="catalog-grid">
          {collection.catalogs.map((catalog) => (
            <Card key={catalog._id} className="catalog-card">
              <h2>{catalog.name}</h2>
              <p>{catalog.description || 'Ready for specimens later.'}</p>
              <span>Empty catalog</span>
            </Card>
          ))}
        </div>
      ) : null}

      <Card>
        <form className="collection-form" onSubmit={handleSubmit}>
          {isAtLimit ? (
            <p className="empty-state">
              You've reached the free collection limit.
            </p>
          ) : null}
          <div className="form-grid">
            <label>
              Specimen name
              <input
                value={specimenName}
                onChange={(event) => setSpecimenName(event.target.value)}
                placeholder="Blue agate"
                required
              />
            </label>
            <label>
              Material type
              <input
                value={materialType}
                onChange={(event) => setMaterialType(event.target.value)}
                placeholder="Agate, jasper, quartz..."
              />
            </label>
            <label>
              Found location
              <input
                value={foundLocation}
                onChange={(event) => setFoundLocation(event.target.value)}
                placeholder="Central Washington"
              />
            </label>
            <label>
              Date found
              <input
                type="date"
                value={dateFound}
                onChange={(event) => setDateFound(event.target.value)}
              />
            </label>
            <label>
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="in_collection">In collection</option>
                <option value="gifted">Gifted</option>
                <option value="traded">Traded</option>
                <option value="sold">Sold</option>
                <option value="donated">Donated</option>
              </select>
            </label>
            <label>
              Acquisition
              <select
                value={acquisitionType}
                onChange={(event) => setAcquisitionType(event.target.value)}
              >
                <option value="found">Found</option>
                <option value="purchased">Purchased</option>
                <option value="traded">Traded</option>
                <option value="gifted">Gifted</option>
              </select>
            </label>
            <label>
              Photo
              <span className="upload-dropzone">
                <Camera aria-hidden="true" />
                <span>{photo ? photo.name : 'Upload specimen photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setPhoto(event.target.files?.[0] ?? null)
                  }
                  required
                />
              </span>
            </label>
          </div>
          <label>
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="Color, pattern, size, trip notes, cleaning notes, or display plans."
            />
          </label>
          {previewUrl ? (
            <div className="single-upload-preview">
              <img src={previewUrl} alt="" />
            </div>
          ) : null}
          <div className="form-footer">
            <span>{message}</span>
            <button
              type="submit"
              disabled={isSaving || isAtLimit || !specimenName.trim() || !photo}
            >
              <Upload aria-hidden="true" />
              {isSaving ? 'Saving...' : 'Add specimen'}
            </button>
          </div>
        </form>
      </Card>

      {collection === undefined ? (
        <EmptyState title="Loading collection..." />
      ) : null}
      {collection?.items.length === 0 ? (
        <EmptyState
          title="Show off your first find."
          description="Upload a photo and a few field notes to start your collection showcase."
        />
      ) : null}
      {collection?.items.length ? (
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
                  <span>{formatStatus(item.status)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  )
}

async function uploadFile(
  file: File,
  generateUploadUrl: () => Promise<string>,
): Promise<Id<'_storage'>> {
  const uploadUrl = await generateUploadUrl()
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!response.ok) throw new Error('Photo upload failed.')
  const { storageId } = (await response.json()) as { storageId: Id<'_storage'> }
  return storageId
}

function emptyToUndefined(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function formatStatus(value: string) {
  return value.replace(/_/g, ' ')
}
