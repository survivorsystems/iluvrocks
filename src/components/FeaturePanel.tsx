import type { LucideIcon } from 'lucide-react'

type FeaturePanelProps = {
  icon: LucideIcon
  title: string
  description: string
}

export default function FeaturePanel({ icon: Icon, title, description }: FeaturePanelProps) {
  return (
    <article className="feature-panel">
      <Icon aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
    </article>
  )
}
