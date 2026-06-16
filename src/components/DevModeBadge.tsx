import { isDevAuthBypass } from '../lib/devAuth'

export default function DevModeBadge() {
  if (!isDevAuthBypass) return null

  return <span className="dev-mode-badge">DEV MODE</span>
}
