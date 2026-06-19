import { Link } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { ArrowRight, Gem, Map, MessageSquare, Pickaxe } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { Card, EmptyState, SectionHeader } from '../components/ui'

const sectionIcons = [Gem, Map, Pickaxe]

export default function Community() {
  const sections = useQuery(api.chat.listForumSections, {})

  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Community forums"
        title="Gather around the right table"
        description="Forum posts stay in these boards, separate from the public discovery feed."
      />

      {sections === undefined ? <EmptyState title="Loading forums..." /> : null}

      <div className="forum-section-list">
        {sections?.map((section, sectionIndex) => {
          const Icon = sectionIcons[sectionIndex] ?? MessageSquare
          return (
            <Card key={section.title} className="forum-section-card">
              <header>
                <Icon aria-hidden="true" />
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.description}</p>
                </div>
              </header>
              <div className="forum-board-grid">
                {section.forums.map((forum) => (
                  <Link
                    key={forum.slug}
                    to={`/community/${forum.slug}`}
                    className="forum-board-link"
                  >
                    <span>
                      <strong>{forum.title}</strong>
                      <em>{forum.description}</em>
                    </span>
                    <small>{forum.postCount} posts</small>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
