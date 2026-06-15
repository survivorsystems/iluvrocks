import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/minerals/$mineralId')({
  component: MineralDetail,
})

function MineralDetail() {
  const { mineralId } = Route.useParams() as { mineralId: string }
  const { data: mineral } = useSuspenseQuery(
    convexQuery(api.minerals.get, { id: mineralId as Id<'minerals'> })
  )

  if (!mineral) {
    return <div className="p-8 text-center font-bold">Mineral not found.</div>
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20 md:pb-0">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-stone-500 font-bold uppercase text-[10px] tracking-widest hover:text-emerald-600 transition-colors mb-8"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to Database
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Main Photo */}
          <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-stone-200 shadow-2xl">
            <img 
              src={mineral.photos[0]} 
              alt={mineral.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="space-y-10">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-stone-900 mb-4 uppercase italic tracking-tighter italic">
                {mineral.name}
              </h1>
              <p className="text-stone-500 text-lg font-medium leading-relaxed">
                {mineral.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1">Hardness</p>
                <p className="text-2xl font-black text-emerald-600 tracking-tighter">{mineral.hardness}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-1">Colors</p>
                <p className="text-sm font-bold text-stone-900 leading-tight">{mineral.colorVariations.join(', ')}</p>
              </div>
            </div>

            <section>
              <h2 className="text-xl font-black text-stone-900 uppercase italic tracking-widest mb-4">Identification Tips</h2>
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl">
                <p className="text-emerald-900 font-medium leading-relaxed text-sm">
                  {mineral.identificationTips}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black text-stone-900 uppercase italic tracking-widest mb-4">Look-alikes</h2>
              <div className="flex flex-wrap gap-2">
                {mineral.lookAlikes.map(lookalike => (
                  <span key={lookalike} className="bg-stone-100 text-stone-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                    {lookalike}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-stone-200 pt-16">
          <section>
            <h2 className="text-lg font-black text-stone-900 uppercase italic tracking-widest mb-4">Geological Context</h2>
            <p className="text-stone-500 text-sm font-medium leading-relaxed">
              {mineral.geologicalInfo}
            </p>
          </section>
          <section>
            <h2 className="text-lg font-black text-stone-900 uppercase italic tracking-widest mb-4">Cleaning</h2>
            <p className="text-stone-500 text-sm font-medium leading-relaxed">
              {mineral.cleaningRecommendations}
            </p>
          </section>
          <section>
            <h2 className="text-lg font-black text-stone-900 uppercase italic tracking-widest mb-4">Display</h2>
            <p className="text-stone-500 text-sm font-medium leading-relaxed">
              {mineral.displayRecommendations}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
