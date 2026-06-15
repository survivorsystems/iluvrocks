import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  BadgeDollarSign, 
  Clock, 
  Plus,
  Filter,
  Search,
  Building,
  GraduationCap,
  Hammer,
  Gem
} from 'lucide-react'

export const Route = createFileRoute('/_community-layout/jobs')({
  component: JobBoardPage,
})

function JobBoardPage() {
  const { data: jobs } = useSuspenseQuery(convexQuery(api.jobs.list, {}))

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <header className="bg-white border-b border-stone-200 pt-16 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
               <h1 className="text-5xl font-black text-stone-900 uppercase italic tracking-tighter italic">Opportunities</h1>
               <p className="text-stone-400 font-medium uppercase text-[10px] tracking-[0.3em] mt-1">Industry Job Board</p>
            </div>
            <button className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-emerald-600 transition-all flex items-center gap-3">
              <Plus className="w-4 h-4" /> Post Opening ($25)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="md:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Job title, company, or keywords..."
                  className="w-full bg-stone-100 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
                />
             </div>
             <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-stone-200 rounded-2xl font-black uppercase tracking-widest text-xs text-stone-900 hover:bg-stone-50 transition-all">
                <Filter className="w-4 h-4" /> Filters
             </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 mt-12 space-y-6">
        {/* Quick Categories */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
           <JobCategory icon={<Hammer className="w-4 h-4" />} label="Lapidary" active />
           <JobCategory icon={<Gem className="w-4 h-4" />} label="Retail" />
           <JobCategory icon={<GraduationCap className="w-4 h-4" />} label="Education" />
           <JobCategory icon={<Building className="w-4 h-4" />} label="Mining" />
        </div>

        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-stone-200">
               <Briefcase className="w-12 h-12 text-stone-200 mx-auto mb-4" />
               <p className="text-stone-400 font-bold uppercase text-[10px] tracking-widest">No positions currently listed</p>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job._id} className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm hover:border-emerald-500 transition-all group cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex gap-6">
                    <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400 group-hover:text-emerald-600 transition-colors">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-black text-stone-900 uppercase italic leading-none">{job.title}</h3>
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                          {job.type}
                        </span>
                      </div>
                      <p className="text-stone-500 font-bold uppercase text-[10px] tracking-widest mb-4">{job.company}</p>
                      
                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2 text-stone-400 text-xs font-medium">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        {job.salaryRange && (
                          <div className="flex items-center gap-2 text-stone-400 text-xs font-medium">
                            <BadgeDollarSign className="w-4 h-4" />
                            {job.salaryRange}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-stone-400 text-xs font-medium">
                          <Clock className="w-4 h-4" />
                          {new Date(job._creationTime).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-lg group-hover:scale-105">
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function JobCategory({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border transition-all ${
      active 
      ? 'bg-stone-900 border-stone-900 text-white shadow-xl' 
      : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400'
    }`}>
      {icon}
      {label}
    </button>
  )
}
