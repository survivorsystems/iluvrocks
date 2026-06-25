import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  Button,
  Card,
  EmptyState,
  Input,
  SectionHeader,
  Textarea,
} from '../components/ui'

const regionOptions = [
  'Central Washington',
  'Olympic Peninsula',
  'North Cascades',
  'Southwest Washington',
  'Eastern Washington',
  'Puget Sound',
]

const specialtyOptions = [
  'Agate',
  'Jasper',
  'Quartz',
  'Petrified wood',
  'Jade',
  'Fossils',
  'Beginner field trips',
  'Ethics and access checks',
  'Lapidary basics',
]

export default function LocalGuideApply() {
  const mine = useQuery((api as any).localGuides.listMine, {})
  const saveGuide = useMutation((api as any).localGuides.saveMine)
  const existing = mine?.[0]
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    displayName: existing?.displayName ?? '',
    region: existing?.region ?? regionOptions[0],
    homeBase: existing?.homeBase ?? '',
    specialties: existing?.specialties ?? ['Agate'],
    guideBio: existing?.guideBio ?? '',
    experienceSummary: existing?.experienceSummary ?? '',
    offerings: existing?.offerings ?? '',
    ethicsStatement: existing?.ethicsStatement ?? '',
    locationPrivacyStatement: existing?.locationPrivacyStatement ?? '',
    favoriteEducationalFinds:
      existing?.favoriteEducationalFinds?.join('\n') ?? '',
    collectionShowcaseNotes: existing?.collectionShowcaseNotes ?? '',
    testimonialQuote: existing?.testimonialQuote ?? '',
    testimonialAttribution: existing?.testimonialAttribution ?? '',
    beginnerFriendly: existing?.beginnerFriendly ?? true,
    familyFriendly: existing?.familyFriendly ?? false,
    accessibilityNotes: existing?.accessibilityNotes ?? '',
    publicContactEmail: existing?.publicContactEmail ?? '',
    websiteUrl: existing?.websiteUrl ?? '',
    bookingUrl: existing?.bookingUrl ?? '',
    photoUrl: existing?.photoUrl ?? '',
    ethicsAgreement: existing?.ethicsAgreement ?? false,
    locationProtectionAgreement:
      existing?.locationProtectionAgreement ?? false,
    independentGuideAgreement: existing?.independentGuideAgreement ?? false,
  })

  useEffect(() => {
    if (!existing) return
    setForm({
      displayName: existing.displayName ?? '',
      region: existing.region ?? regionOptions[0],
      homeBase: existing.homeBase ?? '',
      specialties: existing.specialties ?? ['Agate'],
      guideBio: existing.guideBio ?? '',
      experienceSummary: existing.experienceSummary ?? '',
      offerings: existing.offerings ?? '',
      ethicsStatement: existing.ethicsStatement ?? '',
      locationPrivacyStatement: existing.locationPrivacyStatement ?? '',
      favoriteEducationalFinds:
        existing.favoriteEducationalFinds?.join('\n') ?? '',
      collectionShowcaseNotes: existing.collectionShowcaseNotes ?? '',
      testimonialQuote: existing.testimonialQuote ?? '',
      testimonialAttribution: existing.testimonialAttribution ?? '',
      beginnerFriendly: existing.beginnerFriendly ?? true,
      familyFriendly: existing.familyFriendly ?? false,
      accessibilityNotes: existing.accessibilityNotes ?? '',
      publicContactEmail: existing.publicContactEmail ?? '',
      websiteUrl: existing.websiteUrl ?? '',
      bookingUrl: existing.bookingUrl ?? '',
      photoUrl: existing.photoUrl ?? '',
      ethicsAgreement: existing.ethicsAgreement ?? false,
      locationProtectionAgreement:
        existing.locationProtectionAgreement ?? false,
      independentGuideAgreement: existing.independentGuideAgreement ?? false,
    })
  }, [existing])

  const toggleSpecialty = (specialty: string) => {
    setForm((current) => ({
      ...current,
      specialties: current.specialties.includes(specialty)
        ? current.specialties.filter((item: string) => item !== specialty)
        : [...current.specialties, specialty],
    }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('Saving guide application...')
    setError('')

    try {
      await saveGuide({
        id: existing?._id,
        displayName: form.displayName.trim(),
        region: form.region,
        homeBase: form.homeBase.trim() || undefined,
        specialties: form.specialties,
        guideBio: form.guideBio.trim() || undefined,
        experienceSummary: form.experienceSummary.trim(),
        offerings: form.offerings.trim(),
        ethicsStatement: form.ethicsStatement.trim() || undefined,
        locationPrivacyStatement:
          form.locationPrivacyStatement.trim() || undefined,
        favoriteEducationalFinds: splitLines(form.favoriteEducationalFinds),
        collectionShowcaseNotes:
          form.collectionShowcaseNotes.trim() || undefined,
        testimonialQuote: form.testimonialQuote.trim() || undefined,
        testimonialAttribution:
          form.testimonialAttribution.trim() || undefined,
        beginnerFriendly: form.beginnerFriendly,
        familyFriendly: form.familyFriendly,
        accessibilityNotes: form.accessibilityNotes.trim() || undefined,
        publicContactEmail: form.publicContactEmail.trim() || undefined,
        websiteUrl: form.websiteUrl.trim() || undefined,
        bookingUrl: form.bookingUrl.trim() || undefined,
        photoUrl: form.photoUrl.trim() || undefined,
        ethicsAgreement: form.ethicsAgreement,
        locationProtectionAgreement: form.locationProtectionAgreement,
        independentGuideAgreement: form.independentGuideAgreement,
      })
      setStatus('Guide application saved. It will stay pending until approved.')
    } catch (submitError) {
      setStatus('')
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Guide application could not be saved.',
      )
    }
  }

  if (mine === undefined) {
    return <EmptyState title="Loading guide application..." />
  }

  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Apply as a local guide"
        title="Share local knowledge without giving away everything"
        description="Approved guides can be listed publicly with their region, specialties, offerings, and an external booking or contact link."
        action={
          <Link to="/local-guides" className="secondary-action">
            View guide directory
          </Link>
        }
      />

      {existing ? (
        <Card className="guide-status-card">
          <strong>Current status: {existing.status}</strong>
          <p>
            Your guide profile appears publicly only after it is approved. You
            can update the application details anytime.
          </p>
        </Card>
      ) : null}

      <Card className="guide-application-card">
        <form className="guide-application-form" onSubmit={submit}>
          <div className="form-grid">
            <label>
              Display name
              <Input
                required
                value={form.displayName}
                onChange={(event) =>
                  setForm({ ...form, displayName: event.target.value })
                }
              />
            </label>
            <label>
              Region served
              <select
                value={form.region}
                onChange={(event) =>
                  setForm({ ...form, region: event.target.value })
                }
              >
                {regionOptions.map((region) => (
                  <option key={region}>{region}</option>
                ))}
              </select>
            </label>
            <label>
              Home base
              <Input
                value={form.homeBase}
                onChange={(event) =>
                  setForm({ ...form, homeBase: event.target.value })
                }
                placeholder="Town, county, or general area"
              />
            </label>
            <label>
              Public contact email
              <Input
                type="email"
                value={form.publicContactEmail}
                onChange={(event) =>
                  setForm({ ...form, publicContactEmail: event.target.value })
                }
              />
            </label>
            <label>
              Website
              <Input
                value={form.websiteUrl}
                onChange={(event) =>
                  setForm({ ...form, websiteUrl: event.target.value })
                }
                placeholder="https://..."
              />
            </label>
            <label>
              Booking link
              <Input
                value={form.bookingUrl}
                onChange={(event) =>
                  setForm({ ...form, bookingUrl: event.target.value })
                }
                placeholder="Acuity, Calendly, website, or other booking page"
              />
            </label>
            <label>
              Profile photo URL
              <Input
                value={form.photoUrl}
                onChange={(event) =>
                  setForm({ ...form, photoUrl: event.target.value })
                }
                placeholder="Optional image URL for now"
              />
            </label>
          </div>

          <div>
            <p className="form-label">Specialties</p>
            <div className="directory-chip-row">
              {specialtyOptions.map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  className={
                    form.specialties.includes(specialty) ? 'is-active' : ''
                  }
                  onClick={() => toggleSpecialty(specialty)}
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          <label>
            Guide bio
            <Textarea
              value={form.guideBio}
              onChange={(event) =>
                setForm({ ...form, guideBio: event.target.value })
              }
              placeholder="A warmer public intro: your story, your region, and why you like helping other hounds learn."
            />
          </label>
          <label>
            Experience summary
            <Textarea
              required
              value={form.experienceSummary}
              onChange={(event) =>
                setForm({ ...form, experienceSummary: event.target.value })
              }
              placeholder="Tell visitors what you know, how you collect, and what kind of guidance you are comfortable offering."
            />
          </label>
          <label>
            What you offer
            <Textarea
              required
              value={form.offerings}
              onChange={(event) =>
                setForm({ ...form, offerings: event.target.value })
              }
              placeholder="Examples: beginner field trips, planning calls, public-area walks, ID help, lapidary basics."
            />
          </label>
          <label>
            Ethics statement
            <Textarea
              value={form.ethicsStatement}
              onChange={(event) =>
                setForm({ ...form, ethicsStatement: event.target.value })
              }
              placeholder="How you teach legal access, leave-no-trace collecting, claim checks, and respect for the land."
            />
          </label>
          <label>
            Location protection statement
            <Textarea
              value={form.locationPrivacyStatement}
              onChange={(event) =>
                setForm({
                  ...form,
                  locationPrivacyStatement: event.target.value,
                })
              }
              placeholder="Explain how you protect sensitive or hard-earned locations while still helping beginners learn."
            />
          </label>
          <label>
            Favorite educational finds
            <Textarea
              value={form.favoriteEducationalFinds}
              onChange={(event) =>
                setForm({
                  ...form,
                  favoriteEducationalFinds: event.target.value,
                })
              }
              placeholder={
                'One per line, like:\nEllensburg blue agate\nPetrified wood\nOrbicular jasper'
              }
            />
          </label>
          <label>
            Collection showcase notes
            <Textarea
              value={form.collectionShowcaseNotes}
              onChange={(event) =>
                setForm({
                  ...form,
                  collectionShowcaseNotes: event.target.value,
                })
              }
              placeholder="Tell visitors what your public collection shows about your skills, interests, or teaching style without naming secret spots."
            />
          </label>
          <label>
            Accessibility and terrain notes
            <Textarea
              value={form.accessibilityNotes}
              onChange={(event) =>
                setForm({ ...form, accessibilityNotes: event.target.value })
              }
              placeholder="Share terrain expectations, mobility notes, kid/pet fit, weather or road cautions."
            />
          </label>
          <div className="form-grid">
            <label>
              Testimonial quote
              <Textarea
                value={form.testimonialQuote}
                onChange={(event) =>
                  setForm({ ...form, testimonialQuote: event.target.value })
                }
                placeholder="Optional: add a short quote from someone you helped."
              />
            </label>
            <label>
              Testimonial attribution
              <Input
                value={form.testimonialAttribution}
                onChange={(event) =>
                  setForm({
                    ...form,
                    testimonialAttribution: event.target.value,
                  })
                }
                placeholder="Example: Beginner hound, Skagit County"
              />
            </label>
          </div>

          <div className="guide-checkbox-grid">
            <label>
              <input
                type="checkbox"
                checked={form.beginnerFriendly}
                onChange={(event) =>
                  setForm({ ...form, beginnerFriendly: event.target.checked })
                }
              />
              Beginner-friendly options
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.familyFriendly}
                onChange={(event) =>
                  setForm({ ...form, familyFriendly: event.target.checked })
                }
              />
              Family-friendly options
            </label>
            <label>
              <input
                required
                type="checkbox"
                checked={form.ethicsAgreement}
                onChange={(event) =>
                  setForm({ ...form, ethicsAgreement: event.target.checked })
                }
              />
              I agree to promote ethical, legal collecting.
            </label>
            <label>
              <input
                required
                type="checkbox"
                checked={form.locationProtectionAgreement}
                onChange={(event) =>
                  setForm({
                    ...form,
                    locationProtectionAgreement: event.target.checked,
                  })
                }
              />
              I agree to protect sensitive locations and private knowledge.
            </label>
            <label>
              <input
                required
                type="checkbox"
                checked={form.independentGuideAgreement}
                onChange={(event) =>
                  setForm({
                    ...form,
                    independentGuideAgreement: event.target.checked,
                  })
                }
              />
              I understand guides are independent and manage their own booking.
            </label>
          </div>

          {error ? <p className="form-error">{error}</p> : null}
          {status ? <p className="form-success">{status}</p> : null}
          <Button type="submit">Save guide application</Button>
        </form>
      </Card>
    </section>
  )
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}
