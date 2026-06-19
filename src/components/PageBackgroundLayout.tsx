import type { CSSProperties, ReactNode } from 'react'
import alseaBackground from '../assets/backgrounds/alsea.png'
import cascadesBackground from '../assets/backgrounds/cascades.png'
import haystacksBackground from '../assets/backgrounds/haystacks.png'
import skagitBackground from '../assets/backgrounds/skagit.png'

type PageBackground = 'skagit' | 'alsea' | 'haystacks' | 'cascades'

type PageBackgroundLayoutProps = {
  background: PageBackground
  children: ReactNode
  className?: string
}

const backgroundImages: Record<PageBackground, string> = {
  skagit: skagitBackground,
  alsea: alseaBackground,
  haystacks: haystacksBackground,
  cascades: cascadesBackground,
}

export default function PageBackgroundLayout({
  background,
  children,
  className = '',
}: PageBackgroundLayoutProps) {
  return (
    <div
      className={`page-background-layout ${className}`.trim()}
      style={
        {
          '--page-background-image': `url(${backgroundImages[background]})`,
        } as CSSProperties
      }
    >
      <div className="page-background-layer" aria-hidden="true" />
      <div className="page-background-content">{children}</div>
    </div>
  )
}
