import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_community-layout/community')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_community-layout/community"!</div>
}
