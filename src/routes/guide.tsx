import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { Search, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/guide')({
  component: GuidePage,
})

function GuidePage() {
  const { data: minerals } = useSuspenseQuery(convexQuery(api.minerals.list, {}))
  const [search, setSearch] = useState('')

  const filtered = minerals.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <header className="bg-stone-900 text-white p-8 rounded-b-[3rem] shadow-xl">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Mineral Guide</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
          <input 
            type="text" 
            placeholder="Search minerals, hardness, color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-stone-500"
          />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((mineral) => (
          <Link
            key={mineral._id}
            to="/minerals/$mineralId"
            params={{ mineralId: mineral._id }}
            className="bg-white rounded-[2.5rem] overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={mineral.photos[0]} 
                alt={mineral.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-emerald-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                Hardness: {mineral.hardness}
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-stone-900 uppercase italic tracking-tight">{mineral.name}</h2>
                <ChevronRight className="w-6 h-6 text-stone-300 group-hover:text-emerald-600 transition-colors" />
              </div>
              <p className="text-stone-500 text-sm font-medium line-clamp-2 leading-relaxed">
                {mineral.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-stone-200 px-6 py-3 flex justify-between items-center z-50">
        <NavButton icon={<div className="w-6 h-6 border-2 border-stone-400 rounded-sm rotate-45" />} label="Explore" to="/" />
        <NavButton icon={<div className="w-6 h-6 border-2 border-emerald-600 bg-emerald-600 rounded-lg shadow-sm" />} label="Guide" to="/guide" active />
        <NavButton icon={<div className="w-6 h-6 border-2 border-stone-400 rounded-full" />} label="Chat" to="/chat" />
        <NavButton icon={<div className="w-6 h-6 border-2 border-stone-400 rounded-full" />} label="You" to="/profile" />
      </nav>
    </div>
  )
}

function NavButton({ icon, label, active, to }: { icon: React.ReactNode, label: string, active?: boolean, to: string }) {
  return (
    <Link to={to} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'}`}>
      <div className="w-6 h-6 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </Link>
  )
}
