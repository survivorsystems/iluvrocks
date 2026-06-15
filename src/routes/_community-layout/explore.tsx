import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import { useState, lazy, Suspense } from 'react'
import ClientOnly from '~/components/ClientOnly'

const RockhoundMap = lazy(() => import('~/components/RockhoundMap'))
import { Filter, Search, Compass, X } from 'lucide-react'

export const Route = createFileRoute('/_community-layout/explore')({
  component: ExplorePage,
})

function ExplorePage() {
  const { data: locations } = useSuspenseQuery(convexQuery(api.locations.list, { state: "Washington" }))
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    mineral: '',
    difficulty: '',
    access: '',
    landStatus: '',
    region: ''
  })

  const resetFilters = () => {
    setFilters({
      mineral: '',
      difficulty: '',
      access: '',
      landStatus: '',
      region: ''
    })
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length

  return (
    <div className="h-screen w-full flex flex-col bg-earth-950 overflow-hidden">
      {/* Search & Header */}
      <header className="flex-none p-4 md:p-6 bg-earth-900 border-b border-earth-700 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-none flex items-center gap-3">
             <div className="w-10 h-10 bg-mineral-teal rounded-xl flex items-center justify-center text-earth-50 font-black text-xl italic shadow-lg">R</div>
             <span className="font-black text-earth-50 text-2xl tracking-tighter uppercase italic hidden md:block">Rockhound</span>
          </div>

          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-400" />
            <input 
              type="text" 
              placeholder="Search locations, minerals, or regions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-earth-950 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-earth-50 focus:ring-2 focus:ring-mineral-teal transition-all shadow-inner"
            />
          </div>

          <div className="flex-none flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border ${
                activeFilterCount > 0 
                ? 'bg-mineral-teal border-mineral-teal text-earth-50' 
                : 'bg-earth-800 border-earth-700 text-earth-50 hover:bg-earth-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="max-w-7xl mx-auto mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['Agate', 'Jasper', 'Quartz', 'Jade', 'Fossils', 'Gold', 'Amethyst'].map(mineral => (
            <button
              key={mineral}
              onClick={() => setFilters(f => ({ ...f, mineral: f.mineral === mineral ? '' : mineral }))}
              className={`flex-none px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                filters.mineral === mineral
                ? 'bg-mineral-copper border-mineral-copper text-earth-50 shadow-md'
                : 'bg-earth-800 border-earth-700 text-earth-400 hover:bg-earth-700'
              }`}
            >
              {mineral}
            </button>
          ))}
          <div className="flex-none w-4" /> {/* Spacer */}
        </div>
      </header>

      {/* Map Experience */}
      <main className="flex-1 relative">
        <ClientOnly>
          <Suspense fallback={
            <div className="w-full h-full bg-earth-950 animate-pulse flex items-center justify-center">
              <Compass className="w-12 h-12 text-earth-700 animate-spin" />
            </div>
          }>
            <RockhoundMap 
              locations={locations} 
              filters={filters} 
              searchQuery={searchQuery} 
            />
          </Suspense>
        </ClientOnly>

        {/* Filter Overlay */}
        {showFilters && (
          <div className="absolute top-4 right-4 bottom-24 left-4 md:left-auto md:w-96 z-[1001] bg-earth-900 rounded-[2.5rem] shadow-2xl border border-earth-700 p-8 overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-earth-50 uppercase italic tracking-tight">Refine Map</h2>
              <div className="flex gap-4">
                {activeFilterCount > 0 && (
                  <button onClick={resetFilters} className="text-mineral-copper font-bold text-[10px] uppercase tracking-widest hover:underline">Reset</button>
                )}
                <button onClick={() => setShowFilters(false)} className="text-earth-400 hover:text-earth-50">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {/* Region Filter */}
              <FilterSection label="Region">
                <select 
                  value={filters.region}
                  onChange={(e) => setFilters({...filters, region: e.target.value})}
                  className="w-full bg-earth-950 border border-earth-700 rounded-xl px-4 py-3 text-sm font-bold text-earth-50 appearance-none focus:ring-2 focus:ring-mineral-teal outline-none"
                >
                  <option value="">All Washington</option>
                  <option value="Olympic Peninsula">Olympic Peninsula</option>
                  <option value="Puget Sound">Puget Sound</option>
                  <option value="Cascades">Cascades</option>
                  <option value="Southwest Washington">Southwest Washington</option>
                  <option value="Central Washington">Central Washington</option>
                  <option value="Eastern Washington">Eastern Washington</option>
                </select>
              </FilterSection>

              {/* Mineral Filter */}
              <FilterSection label="Mineral Type">
                <div className="grid grid-cols-2 gap-2">
                  {['Agate', 'Jasper', 'Quartz', 'Geodes', 'Petrified Wood', 'Garnets', 'Jade', 'Obsidian', 'Fossils', 'Gold'].map(mineral => (
                    <button
                      key={mineral}
                      onClick={() => setFilters({...filters, mineral: filters.mineral === mineral ? '' : mineral})}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        filters.mineral === mineral 
                        ? 'bg-mineral-teal border-mineral-teal text-earth-50 shadow-lg' 
                        : 'bg-earth-950 border-earth-700 text-earth-400 hover:border-earth-400'
                      }`}
                    >
                      {mineral}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Difficulty */}
              <FilterSection label="Difficulty">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(d => (
                    <button
                      key={d}
                      onClick={() => setFilters({...filters, difficulty: filters.difficulty === d.toString() ? '' : d.toString()})}
                      className={`flex-1 py-3 rounded-xl text-xs font-black border transition-all ${
                        filters.difficulty === d.toString() 
                        ? 'bg-mineral-copper border-mineral-copper text-earth-50 shadow-lg' 
                        : 'bg-earth-950 border-earth-700 text-earth-400'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Access Type */}
              <FilterSection label="Access Type">
                 <select 
                  value={filters.access}
                  onChange={(e) => setFilters({...filters, access: e.target.value})}
                  className="w-full bg-earth-950 border border-earth-700 rounded-xl px-4 py-3 text-sm font-bold text-earth-50 appearance-none focus:ring-2 focus:ring-mineral-teal outline-none"
                >
                  <option value="">Any Access</option>
                  <option value="Roadside">Roadside</option>
                  <option value="Short Walk">Short Walk</option>
                  <option value="Moderate Hike">Moderate Hike</option>
                  <option value="Long Hike">Long Hike</option>
                </select>
              </FilterSection>

              <button 
                onClick={() => setShowFilters(false)}
                className="w-full bg-mineral-teal text-earth-50 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-mineral-teal-hover transition-all mt-4"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function FilterSection({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-earth-400 uppercase tracking-[0.2em] ml-2">{label}</label>
      {children}
    </div>
  )
}
