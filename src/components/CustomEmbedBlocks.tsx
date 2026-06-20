import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card } from './ui'

type CustomEmbedBlock = {
  id: string
  page: string
  blockType: string
  title: string
  description: string
  code: string
  enabled: boolean
  order: number
}

export default function CustomEmbedBlocks() {
  const location = useLocation()
  const appearance = useQuery((api as any).adminPublic.getSiteAppearance, {})
  const pageKey = getPageKey(location.pathname)
  const blocks = useMemo(
    () => parseCustomEmbeds(appearance?.customEmbedsJson, pageKey),
    [appearance?.customEmbedsJson, pageKey],
  )

  if (!blocks.length) return null

  return (
    <section className="custom-embed-section" aria-label="Custom page content">
      {blocks.map((block) => (
        <Card key={block.id} className="custom-embed-card">
          {block.title || block.description ? (
            <header>
              {block.title ? <h2>{block.title}</h2> : null}
              {block.description ? <p>{block.description}</p> : null}
            </header>
          ) : null}
          <div
            className="custom-embed-content"
            dangerouslySetInnerHTML={{ __html: block.code }}
          />
        </Card>
      ))}
    </section>
  )
}

function parseCustomEmbeds(value: string | undefined, pageKey: string) {
  if (!value?.trim()) return []
  try {
    const blocks = JSON.parse(value) as CustomEmbedBlock[]
    if (!Array.isArray(blocks)) return []
    return blocks
      .filter((block) => block.enabled && block.page === pageKey)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch {
    return []
  }
}

function getPageKey(pathname: string) {
  if (pathname === '/') return 'home'
  return pathname.split('/').filter(Boolean)[0] || 'home'
}
