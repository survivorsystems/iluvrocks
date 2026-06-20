import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
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
const tripWishlistKey = 'iluvrocks.tripWishlist'

export default function TripPlanner() {
  const data = useQuery((api as any).tripPlanning.publicSearch, {})
  const destinations = data?.destinations ?? []
  const [savedTrips, setSavedTrips] = useLocalList<SavedTrip>(tripsKey)
  const [tripWishlist, setTripWishlist] =
    useLocalList<WishlistItem>(tripWishlistKey)

  const savePlannedTrip = (
    destination: any,
    visibility: 'private' | 'public',
  ) => {
    setSavedTrips([
      {
        id: crypto.randomUUID(),
        title: `${destination.name} trip`,
        destination: destination.name,
        notes: destination.summary,
        visibility,
        createdAt: new Date().toISOString(),
      },
      ...savedTrips,
    ])
  }

  const saveTripWishlist = (destination: any) => {
    setTripWishlist([
      {
        id: crypto.randomUUID(),
        title: destination.name,
        notes: destination.summary,
        createdAt: new Date().toISOString(),
      },
      ...tripWishlist,
    ])
  }

  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Trip planner"
        title="Plan your next adventure"
        description="Start with a destination, then check materials, permits, safety, local supplies, lodging, campgrounds, and curated itineraries."
      />
      <div className="trip-planner-steps">
        {[
          [
            '1',
            'Choose a destination',
            'Search Washington beaches, rivers, forests, and public collecting areas.',
          ],
          [
            '2',
            'Check materials',
            'See what is commonly found there and what needs careful identification.',
          ],
          [
            '3',
            'Plan the practical details',
            'Review permits, safety notes, gas, groceries, lodging, rock shops, and ranger offices.',
          ],
        ].map(([step, title, text]) => (
          <Card key={step} className="trip-step-card">
            <strong>{step}</strong>
            <h2>{title}</h2>
            <p>{text}</p>
          </Card>
        ))}
      </div>
      <div className="feature-grid">
        {destinations.slice(0, 6).map((destination: any) => (
          <Card key={destination._id} as="article" className="trip-result-card">
            <Link to={`/destinations/${destination.slug}`}>
              <span>{destination.region}</span>
              <h2>{destination.name}</h2>
              <p>{destination.summary}</p>
            </Link>
            <div className="trip-save-actions">
              <button
                type="button"
                onClick={() => savePlannedTrip(destination, 'private')}
              >
                Save private plan
              </button>
              <button
                type="button"
                onClick={() => savePlannedTrip(destination, 'public')}
              >
                Save public plan
              </button>
              <button
                type="button"
                onClick={() => saveTripWishlist(destination)}
              >
                Add to wishlist
              </button>
            </div>
          </Card>
        ))}
      </div>
      {!destinations.length ? (
        <EmptyState
          title="No trip plans published yet"
          description="Create destinations and itineraries from the Admin Dashboard."
        />
      ) : null}
    </section>
  )
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
