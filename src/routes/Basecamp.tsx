import RockhoundDashboard from '../components/RockhoundDashboard'
import PageBackgroundLayout from '../components/PageBackgroundLayout'

export default function Basecamp() {
  return (
    <PageBackgroundLayout background="skagit">
      <RockhoundDashboard mode="basecamp" />
    </PageBackgroundLayout>
  )
}
