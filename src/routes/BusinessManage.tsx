import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card, SectionHeader } from '../components/ui'

export default function BusinessManage() {
  const mine = useQuery((api as any).businesses.listMine, {}) ?? []
  const saveBusiness = useMutation((api as any).businesses.saveMine)
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Rock shop',
    website: '',
    email: '',
    phone: '',
    location: '',
    plan: 'free',
    leadEmail: '',
  })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('Saving business profile...')
    try {
      await saveBusiness({
        ...form,
        description: emptyToUndefined(form.description),
        website: emptyToUndefined(form.website),
        email: emptyToUndefined(form.email),
        phone: emptyToUndefined(form.phone),
        location: emptyToUndefined(form.location),
        leadEmail: emptyToUndefined(form.leadEmail),
      })
      setStatus('Business profile saved for owner review.')
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Business profile could not be saved.',
      )
    }
  }

  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Business onboarding"
        title="Create or manage your business profile"
        description="Businesses can manage only their own profile. Owner approval controls public visibility, featured placement, and Founding Business badges."
      />
      <div className="admin-split">
        <Card className="admin-panel">
          <form className="admin-form" onSubmit={submit}>
            <AdminInput
              label="Business name"
              value={form.name}
              onChange={(value) => setForm({ ...form, name: value })}
            />
            <div className="form-grid">
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                >
                  <option>Rock shop</option>
                  <option>Lapidary</option>
                  <option>Guide</option>
                  <option>Educator</option>
                  <option>Club</option>
                  <option>Supplies</option>
                </select>
              </label>
              <label>
                Account plan
                <select
                  value={form.plan}
                  onChange={(event) =>
                    setForm({ ...form, plan: event.target.value })
                  }
                >
                  <option value="free">Free Business Profile</option>
                  <option value="basic">
                    Basic Business Account - $9.99/mo
                  </option>
                  <option value="premium">
                    Premium Business Account - $24.99/mo
                  </option>
                </select>
              </label>
            </div>
            <label>
              Description
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </label>
            <div className="form-grid">
              <AdminInput
                label="Website"
                value={form.website}
                onChange={(value) => setForm({ ...form, website: value })}
              />
              <AdminInput
                label="Public email"
                value={form.email}
                onChange={(value) => setForm({ ...form, email: value })}
              />
              <AdminInput
                label="Phone"
                value={form.phone}
                onChange={(value) => setForm({ ...form, phone: value })}
              />
              <AdminInput
                label="Location"
                value={form.location}
                onChange={(value) => setForm({ ...form, location: value })}
              />
              <AdminInput
                label="Lead form email"
                value={form.leadEmail}
                onChange={(value) => setForm({ ...form, leadEmail: value })}
              />
            </div>
            <div className="settings-save-bar">
              <span>{status}</span>
              <button type="submit">Save business profile</button>
            </div>
          </form>
        </Card>
        <Card className="admin-list-card">
          <h2>Your business profiles</h2>
          {mine.length ? (
            <div className="admin-list">
              {mine.map((business: any) => (
                <article key={business._id}>
                  <strong>{business.name}</strong>
                  <span>
                    {business.plan} |{' '}
                    {business.isApproved ? 'approved' : 'pending approval'}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <p className="form-note">No business profiles yet.</p>
          )}
        </Card>
      </div>
    </section>
  )
}

function AdminInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label>
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function emptyToUndefined(value: string) {
  const clean = value.trim()
  return clean || undefined
}
