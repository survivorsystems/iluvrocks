import { useEffect } from 'react'
import type { ReactNode } from 'react'
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
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('has-page-background')
    const fallbackBackground = `url(${backgroundImages[background]})`
    const customBackground =
      background === 'skagit'
        ? `var(--theme-homepage-background-image, ${fallbackBackground})`
        : `var(--theme-default-page-background-image, ${fallbackBackground})`
    root.style.setProperty('--active-page-background-image', customBackground)

    return () => {
      root.classList.remove('has-page-background')
      root.style.removeProperty('--active-page-background-image')
    }
  }, [background])

  return (
    <div className={`page-background-layout ${className}`.trim()}>
      <div className="page-background-content">{children}</div>
    </div>
  )
}
