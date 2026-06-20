import { Link, useParams } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card, EmptyState, SectionHeader } from '../components/ui'

const geologyFields = [
  ['geologicFormations', 'Geologic formations'],
  ['geologicAge', 'Geologic age'],
  ['likelyMaterials', 'Likely materials'],
  ['materialOccurrence', 'Why those materials occur there'],
  ['fieldClues', 'Field clues'],
  ['commonLookalikes', 'Common lookalikes'],
  ['terrainNotes', 'Terrain notes'],
  ['erosionDepositionNotes', 'Erosion/deposition notes'],
  ['collectionLegalityNotes', 'Collection legality notes'],
  ['sourceNotes', 'Source notes/links'],
] as const

export default function TripDetail() {
  const { slug = '' } = useParams()
  const data = useQuery((api as any).tripPlanning.getItineraryBySlug, { slug })

  if (data === undefined) return <p className="empty-state">Loading trip...</p>
  if (!data) {
    return (
      <EmptyState
        title="Trip not found"
        description="This itinerary is not published yet."
        action={
          <Link to="/trip-planner" className="primary-action">
            Open trip planner
          </Link>
        }
      />
    )
  }

  const { itinerary, destination } = data
  const geologySummary = itinerary.geologySummary?.trim()
  const hasGeology =
    geologySummary ||
    geologyFields.some(([key]) => String(itinerary[key] ?? '').trim())

  return (
    <section className="workspace-page trip-detail-page">
      <SectionHeader
        eyebrow={`${destination.name} | ${itinerary.duration || 'Flexible trip'}`}
        title={itinerary.title}
        description={itinerary.overview}
        action={
          <Link
            to={`/destinations/${destination.slug}`}
            className="primary-action"
          >
            View destination
          </Link>
        }
      />

      <div className="destination-layout">
        <div className="destination-main">
          <Card className="destination-info-card">
            <h2>Trip plan</h2>
            <p>{itinerary.overview}</p>
            {itinerary.stopsJson ? (
              <div className="trip-detail-note">
                <strong>Stops / notes</strong>
                <p>{itinerary.stopsJson}</p>
              </div>
            ) : null}
          </Card>

          <Card className="destination-info-card">
            <h2>Packing list</h2>
            <p>{itinerary.packingList || 'Packing notes coming soon.'}</p>
          </Card>

          <Card className="destination-info-card">
            <h2>Safety notes</h2>
            <p>{itinerary.safetyNotes || 'Safety notes coming soon.'}</p>
          </Card>
        </div>

        <aside className="destination-rail">
          <Card className="destination-info-card">
            <h2>Trip details</h2>
            <div className="trip-chip-row">
              <em>{itinerary.duration || 'Flexible duration'}</em>
              <em>{itinerary.difficulty || 'Difficulty TBD'}</em>
              <em>{destination.region}</em>
            </div>
          </Card>
        </aside>
      </div>

      <Card className="geology-analysis-card">
        <div className="geology-analysis-header">
          <span className="eyebrow">Educational geology</span>
          <h2>Geology Analysis</h2>
          <p>
            Geology notes are educational field context and are separate from
            safety, access, and legal guidance.
          </p>
          {itinerary.confidenceLevel ? (
            <span className="confidence-pill">
              Confidence: {itinerary.confidenceLevel}
            </span>
          ) : null}
        </div>

        {hasGeology ? (
          <div className="geology-analysis-grid">
            {geologySummary ? (
              <details open>
                <summary>Geology summary</summary>
                <p>{geologySummary}</p>
              </details>
            ) : null}
            {geologyFields.map(([key, label]) => {
              const value = String(itinerary[key] ?? '').trim()
              if (!value) return null
              return (
                <details key={key}>
                  <summary>{label}</summary>
                  <p>{value}</p>
                </details>
              )
            })}
          </div>
        ) : (
          <p className="form-note">
            Geology analysis has not been added for this trip yet.
          </p>
        )}
      </Card>
    </section>
  )
}
