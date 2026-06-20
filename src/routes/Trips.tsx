import { useEffect, useMemo, useState } from 'react'
import { Bookmark, Eye, EyeOff, Map, Plus, Route, Sparkles } from 'lucide-react'
import { Card, EmptyState, SectionHeader } from '../components/ui'

type SavedTrip = {
  id: string
  title: string
  destination?: string
  notes?: string
  visibility: 'private' | 'public'
  createdAt: string
}

type WishlistItem = {
  id: string
  title: string
  notes?: string
  createdAt: string
}

const tripsKey = 'iluvrocks.savedTrips'
const rockWishlistKey = 'iluvrocks.rockWishlist'
const tripWishlistKey = 'iluvrocks.tripWishlist'

export default function Trips() {
  const [savedTrips, setSavedTrips] = useLocalList<SavedTrip>(tripsKey)
  const [rockWishlist, setRockWishlist] =
    useLocalList<WishlistItem>(rockWishlistKey)
  const [tripWishlist, setTripWishlist] =
    useLocalList<WishlistItem>(tripWishlistKey)
  const [activeTab, setActiveTab] = useState<
    'planned' | 'tripWishlist' | 'rockWishlist'
  >('planned')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'public'>('private')

  const currentList =
    activeTab === 'planned'
      ? savedTrips
      : activeTab === 'tripWishlist'
        ? tripWishlist
        : rockWishlist

  const addItem = () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    const base = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    }

    if (activeTab === 'planned') {
      setSavedTrips([{ ...base, visibility }, ...savedTrips])
    } else if (activeTab === 'tripWishlist') {
      setTripWishlist([base, ...tripWishlist])
    } else {
      setRockWishlist([base, ...rockWishlist])
    }

    setTitle('')
    setNotes('')
  }

  const toggleVisibility = (tripId: string) => {
    setSavedTrips(
      savedTrips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              visibility: trip.visibility === 'private' ? 'public' : 'private',
            }
          : trip,
      ),
    )
  }

  return (
    <section className="workspace-page trips-page">
      <SectionHeader
        eyebrow="Basecamp trips"
        title="Trips and wishlists"
        description="Save planned trips from the Trip Planner, keep a trip wishlist, and track rocks you want to find."
      />

      <div className="trip-tabs" role="tablist" aria-label="Trip lists">
        <button
          type="button"
          className={activeTab === 'planned' ? 'is-active' : undefined}
          onClick={() => setActiveTab('planned')}
        >
          <Route aria-hidden="true" />
          Planned trips
        </button>
        <button
          type="button"
          className={activeTab === 'tripWishlist' ? 'is-active' : undefined}
          onClick={() => setActiveTab('tripWishlist')}
        >
          <Map aria-hidden="true" />
          Trip wishlist
        </button>
        <button
          type="button"
          className={activeTab === 'rockWishlist' ? 'is-active' : undefined}
          onClick={() => setActiveTab('rockWishlist')}
        >
          <Sparkles aria-hidden="true" />
          Rock wishlist
        </button>
      </div>

      <div className="trips-layout">
        <Card className="trip-list-form">
          <h2>Add to {getTabLabel(activeTab)}</h2>
          <label>
            Name
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={
                activeTab === 'rockWishlist'
                  ? 'Blue agate, jade, petrified wood...'
                  : 'Olympic coast weekend, river hunt...'
              }
            />
          </label>
          <label>
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add reminders, materials, routes, or ideas."
            />
          </label>
          {activeTab === 'planned' ? (
            <label>
              Visibility
              <select
                value={visibility}
                onChange={(event) =>
                  setVisibility(event.target.value as 'private' | 'public')
                }
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </label>
          ) : null}
          <button type="button" className="primary-action" onClick={addItem}>
            <Plus aria-hidden="true" />
            Save item
          </button>
        </Card>

        <Card className="trip-list-card">
          <h2>{getTabLabel(activeTab)}</h2>
          {currentList.length ? (
            <div className="saved-trip-list">
              {currentList.map((item) => (
                <article key={item.id}>
                  <div>
                    <h3>{item.title}</h3>
                    {item.notes ? <p>{item.notes}</p> : null}
                    {'visibility' in item ? (
                      <span>
                        {item.visibility === 'private' ? 'Private' : 'Public'}
                      </span>
                    ) : null}
                  </div>
                  {'visibility' in item ? (
                    <button
                      type="button"
                      onClick={() => toggleVisibility(item.id)}
                    >
                      {item.visibility === 'private' ? (
                        <EyeOff aria-hidden="true" />
                      ) : (
                        <Eye aria-hidden="true" />
                      )}
                      {item.visibility === 'private'
                        ? 'Make public'
                        : 'Make private'}
                    </button>
                  ) : (
                    <Bookmark aria-hidden="true" />
                  )}
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title={`No ${getTabLabel(activeTab).toLowerCase()} yet`}
              description="Start a list here, or save destination ideas from the Trip Planner."
            />
          )}
        </Card>
      </div>
    </section>
  )
}

function getTabLabel(tab: 'planned' | 'tripWishlist' | 'rockWishlist') {
  if (tab === 'planned') return 'Planned trips'
  if (tab === 'tripWishlist') return 'Trip wishlist'
  return 'Rock wishlist'
}

function useLocalList<T>(key: string) {
  const [items, setItems] = useState<T[]>([])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      setItems(raw ? (JSON.parse(raw) as T[]) : [])
    } catch {
      setItems([])
    }
  }, [key])

  const setStoredItems = useMemo(
    () => (nextItems: T[]) => {
      setItems(nextItems)
      window.localStorage.setItem(key, JSON.stringify(nextItems))
    },
    [key],
  )

  return [items, setStoredItems] as const
}
