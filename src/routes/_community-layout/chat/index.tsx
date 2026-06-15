import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../../convex/_generated/api'

export const Route = createFileRoute('/_community-layout/chat/')({
  component: ChatIndex,
})

function ChatIndex() {
  const { data: rooms } = useSuspenseQuery(convexQuery(api.chat.listRooms, {}))

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="bg-emerald-900 text-white p-8 rounded-b-[2.5rem] shadow-xl">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Community Chat</h1>
        <p className="text-emerald-100 font-medium opacity-80 uppercase text-[10px] tracking-[0.2em]">Connect with fellow rockhounds</p>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {rooms.map((room) => (
          <Link
            key={room._id}
            to="/chat/$roomSlug"
            params={{ roomSlug: room.slug }}
            className="flex items-center gap-6 bg-white p-6 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <RoomIcon icon={room.icon} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-stone-900 mb-1">{room.name}</h2>
              <p className="text-stone-500 text-sm font-medium">{room.description}</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-stone-300 group-hover:text-emerald-600 transition-colors">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}

function RoomIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'gem':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
          <path d="M6 3h12l4 6-10 12L2 9z" />
          <path d="M11 3v18" />
          <path d="M2 9h20" />
        </svg>
      )
    case 'users':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      )
    case 'waves':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
          <path d="M2 6c.6.5 1.2 1 2.5 1C5.8 7 7 5.6 8.2 5c1.3-.6 2.5-1 3.8-1 1.3 0 2.5.4 3.8 1 1.2.6 2.4 2 3.7 2 1.3 0 1.9-.5 2.5-1" />
          <path d="M2 12c.6.5 1.2 1 2.5 1 1.3 0 2.5-1.4 3.7-2 1.3-.6 2.5-1 3.8-1 1.3 0 2.5.4 3.8 1 1.2.6 2.4 2 3.7 2 1.3 0 1.9-.5 2.5-1" />
          <path d="M2 18c.6.5 1.2 1 2.5 1 1.3 0 2.5-1.4 3.7-2 1.3-.6 2.5-1 3.8-1 1.3 0 2.5.4 3.8 1 1.2.6 2.4 2 3.7 2 1.3 0 1.9-.5 2.5-1" />
        </svg>
      )
    case 'search':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      )
    default:
      return null
  }
}
