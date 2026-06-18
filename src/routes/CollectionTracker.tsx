import { useState } from 'react'
import type { FormEvent } from 'react'
import { Camera, Gem, Upload } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Card, EmptyState, SectionHeader } from '../components/ui'

export default function CollectionTracker() {
  const collectionItems = useQuery(api.collections.listMine, {})
  const createItem = useMutation(api.collections.createItem)
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl)
  const [name, setName] = useState('')
  const [origin, setOrigin] = useState('')
  const [status, setStatus] = useState('Needs catalog photo')
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)
    setIsSaving(true)

    try {
      const storageId = photo ? await uploadFile(photo, generateUploadUrl) : undefined
      await createItem({
        name: name.trim(),
        origin: emptyToUndefined(origin),
        status: emptyToUndefined(status),
        notes: emptyToUndefined(notes),
        storageId,
      })
      setName('')
      setOrigin('')
      setStatus('Needs catalog photo')
      setNotes('')
      setPhoto(null)
      setMessage('Specimen added to your collection.')
    } catch (error) {
      const detail = error instanceof Error ? error.message : ''
      setMessage(detail.includes('Unauthorized') ? 'Sign in before adding collection photos.' : 'Collection item could not be saved.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Collection tracker"
        title="Catalog the keepers"
        description="Add specimens, upload a photo, and start building a field-ready personal collection."
      />

      <Card>
        <form className="collection-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Specimen name
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Carnelian agate" required />
            </label>
            <label>
              Origin
              <input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="Olympic Peninsula" />
            </label>
            <label>
              Status
              <input value={status} onChange={(event) => setStatus(event.target.value)} placeholder="Cleaned, photographed, displayed..." />
            </label>
            <label>
              Photo
              <span className="upload-dropzone">
                <Camera aria-hidden="true" />
                <span>{photo ? photo.name : 'Upload specimen photo'}</span>
                <input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
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
          {photo ? (
            <div className="single-upload-preview">
              <img src={URL.createObjectURL(photo)} alt="" />
            </div>
          ) : null}
          <div className="form-footer">
            <span>{message}</span>
            <button type="submit" disabled={isSaving || !name.trim()}>
              <Upload aria-hidden="true" />
              {isSaving ? 'Saving...' : 'Add specimen'}
            </button>
          </div>
        </form>
      </Card>

      {collectionItems === undefined ? <EmptyState title="Loading collection..." /> : null}
      {collectionItems?.length === 0 ? (
        <EmptyState
          title="Your collection is ready"
          description="Add your first specimen above. Photos, notes, and origins will show here."
        />
      ) : null}
      {collectionItems?.length ? (
        <div className="collection-grid">
          {collectionItems.map((item) => (
            <Card key={item._id} as="article" className="collection-card">
              {item.photoUrl ? (
                <img src={item.photoUrl} alt="" />
              ) : (
                <div className="collection-photo-placeholder" aria-hidden="true">
                  <Gem />
                </div>
              )}
              <div>
                <h2>{item.name}</h2>
                <p>{item.origin || 'Origin not added yet'}</p>
                <span>{item.status || 'Unsorted'}</span>
                {item.notes ? <p>{item.notes}</p> : null}
              </div>
            </Card>
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
