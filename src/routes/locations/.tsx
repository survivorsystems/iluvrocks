import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import { useState } from 'react'
import { 
  MapPin, 
  Zap, 
  ShieldAlert, 
  Dna, 
  ArrowRight, 
  ChevronRight, 
  MessageSquare,
  Cloud,
  Droplets,
  Wind,
  Plus,
  Camera,
  Heart,
  Share2,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Map as MapIcon
} from 'lucide-react'
import SafetyCheckinModal from '~/components/SafetyCheckinModal'

export const Route = createFileRoute('/locations/$locationId')({
  component: LocationDetail,
})

function LocationDetail() {
  const { locationId } = useParams({ from: '/locations/$locationId' })
  const { data: details } = useSuspenseQuery(convexQuery(api.locationActivity.getLocationDetails, { locationId: locationId as any }))
  
  const [activeTab, setActiveTab] = useState<'intel' | 'feed' | 'minerals' | 'safety'>('intel')
  const [showCheckinModal, setShowCheckinModal] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)

  if (!details) return <div>Location not found</div>

  const { location, weather, findReports, minerals } = details

  return (
    <div className="min-h-screen bg-earth-950 pb-20">
      {/* Immersive Header */}
      <div className="h-[50vh] md:h-[60vh] relative overflow-hidden bg-earth-950">
        <img 
          src={location.photos[0]} 
          className="w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-earth-950 via-earth-950/20 to-transparent" />
        
        <div className="absolute top-8 left-6 right-6 flex justify-between items-center z-10">
          <Link to="/explore" className="w-12 h-12 bg-earth-50/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-earth-50 hover:bg-earth-50/20 transition-all border border-white/10">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </Link>
          <div className="flex gap-3">
             <button className="w-12 h-12 bg-earth-50/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-earth-50 hover:bg-earth-50/20 transition-all border border-white/10">
                <Heart className="w-5 h-5" />
             </button>
             <button className="w-12 h-12 bg-earth-50/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-earth-50 hover:bg-earth-50/20 transition-all border border-white/10">
                <Share2 className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="absolute bottom-12 left-6 right-6">
          <div className="max-w-6xl mx-auto">
             <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-mineral-teal text-earth-50 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                  {location.landStatus}
                </span>
                <span className="bg-earth-50/10 backdrop-blur-md text-earth-50 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                  {location.accessType || 'Public'}
                </span>
             </div>
             <h1 className="text-5xl md:text-8xl font-black text-earth-50 uppercase italic tracking-tighter leading-none mb-4">
                {location.name}
             </h1>
             <div className="flex items-center gap-6 text-earth-50/60 font-bold uppercase text-xs tracking-widest">
                <div className="flex items-center gap-2">
                   <MapPin className="w-4 h-4 text-mineral-teal" />
                   {location.region}, {location.state}
                </div>
                <div className="flex items-center gap-2">
                   <Navigation className="w-4 h-4 text-mineral-teal" />
                   {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-earth-900 p-4 rounded-[2rem] shadow-xl border border-earth-700 flex flex-wrap gap-4">
              <button 
                onClick={() => setShowCheckinModal(true)}
                className="flex-1 min-w-[200px] bg-mineral-teal text-earth-50 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-mineral-teal-hover transition-all flex items-center justify-center gap-3"
              >
                <ShieldAlert className="w-5 h-5 text-earth-50" /> Safety Check-In
              </button>
              <button 
                onClick={() => setShowLogModal(true)}
                className="flex-1 min-w-[200px] bg-mineral-copper text-earth-50 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-mineral-copper-hover transition-all flex items-center justify-center gap-3"
              >
                <Plus className="w-5 h-5 text-earth-50" /> Log a Find
              </button>
            </div>

            <div className="flex gap-8 border-b border-earth-700 px-4 overflow-x-auto scrollbar-hide">
               <TabBtn active={activeTab === 'intel'} onClick={() => setActiveTab('intel')} label="Site Intel" />
               <TabBtn active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} label="Community Feed" />
               <TabBtn active={activeTab === 'minerals'} onClick={() => setActiveTab('minerals')} label="Minerals" />
               <TabBtn active={activeTab === 'safety'} onClick={() => setActiveTab('safety')} label="Safety & Access" />
            </div>

            <div className="pt-4">
               {activeTab === 'intel' && (
                 <div className="space-y-8">
                    <section className="bg-earth-900 rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-earth-700 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-earth-50">
                          <MapIcon className="w-64 h-64" />
                       </div>
                       <h2 className="text-4xl font-black text-earth-50 uppercase italic tracking-tighter mb-8">The Geology</h2>
                       <p className="text-earth-200 text-xl font-medium leading-relaxed italic mb-12">
                         "{location.description}"
                       </p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <h4 className="text-[10px] font-black text-earth-700 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-mineral-green" /> Common Finds
                             </h4>
                             <div className="flex flex-wrap gap-2">
                                {location.typicalFinds.map(find => (
                                  <span key={find} className="bg-earth-950 text-earth-50 border border-earth-800 px-4 py-2 rounded-xl text-xs font-black uppercase">{find}</span>
                                ))}
                             </div>
                          </div>
                          <div className="p-6 bg-earth-950 rounded-3xl border border-earth-800">
                             <h4 className="text-[10px] font-black text-earth-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                               <Zap className="w-3 h-3 text-mineral-copper" /> Access Note
                             </h4>
                             <p className="text-sm font-bold text-earth-200 leading-snug italic">{location.parkingInfo}</p>
                          </div>
                       </div>
                    </section>

                    <section className="bg-earth-800 border border-earth-700 rounded-[2.5rem] p-8 flex items-center justify-between group cursor-pointer">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-earth-950 flex items-center justify-center border border-earth-700 text-mineral-teal group-hover:bg-mineral-teal group-hover:text-earth-50 transition-all">
                             <MessageSquare className="w-7 h-7" />
                          </div>
                          <div>
                             <h4 className="text-xl font-black text-earth-50 uppercase italic">Regional Hub</h4>
                             <p className="text-earth-400 text-xs font-bold uppercase tracking-widest">Connect with {location.region} locals</p>
                          </div>
                       </div>
                       <ChevronRight className="w-6 h-6 text-earth-700 group-hover:text-earth-50 transition-all" />
                    </section>
                 </div>
               )}

               {activeTab === 'feed' && (
                 <div className="space-y-6">
                    {findReports.length === 0 ? (
                      <div className="py-20 text-center bg-earth-900 rounded-[2.5rem] border border-earth-700 border-dashed">
                         <Camera className="w-12 h-12 text-earth-800 mx-auto mb-4" />
                         <p className="text-earth-400 font-bold uppercase text-xs">No community activity yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {findReports.map(report => (
                          <div key={report._id} className="bg-earth-900 border border-earth-700 rounded-[2.5rem] overflow-hidden group">
                             <div className="aspect-square bg-earth-950 relative overflow-hidden">
                                {report.photoUrls?.[0] && <img src={report.photoUrls[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                             </div>
                             <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                   <div className="w-6 h-6 rounded-full bg-earth-800 overflow-hidden border border-earth-700">
                                      {report.user?.image && <img src={report.user.image} className="w-full h-full object-cover" />}
                                   </div>
                                   <span className="text-[10px] font-black uppercase text-earth-400">@{report.user?.username || 'explorer'}</span>
                                </div>
                                <h4 className="font-black text-earth-50 uppercase text-lg mb-1">{report.mineralName}</h4>
                                <p className="text-earth-400 text-sm font-medium italic line-clamp-2">"{report.description}"</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
               )}

               {activeTab === 'minerals' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {minerals.map(mineral => (
                      <Link 
                        key={mineral.mineralId}
                        to="/minerals/$mineralId"
                        params={{ mineralId: mineral.mineralId }}
                        className="group bg-earth-900 p-6 rounded-3xl border border-earth-700 hover:border-mineral-teal transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 bg-earth-950 rounded-2xl flex items-center justify-center border border-earth-700 overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                              {mineral.detail?.photos?.[0] ? (
                                <img src={mineral.detail.photos[0]} className="w-full h-full object-cover" />
                              ) : (
                                <Dna className="w-7 h-7 text-earth-800" />
                              )}
                           </div>
                           <div>
                              <h3 className="font-black text-earth-50 uppercase text-sm leading-tight mb-1">{mineral.detail?.name || 'Unknown'}</h3>
                              <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest">{mineral.detail?.hardness || '?' } Hardness • {mineral.likelihood}</p>
                           </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-earth-800 group-hover:text-mineral-teal transition-colors" />
                      </Link>
                    ))}
                  </div>
               )}

               {activeTab === 'safety' && (
                 <div className="space-y-6">
                    <section className="bg-earth-900 border border-earth-700 rounded-[2.5rem] p-8">
                       <h3 className="text-xl font-black text-earth-50 uppercase italic mb-6">Site Access Profile</h3>
                       <div className="space-y-8">
                          <AccessItem label="Terrain" value={location.terrain || 'Mountainous'} />
                          <AccessItem label="Land Status" value={location.landStatus} highlight />
                          <AccessItem label="Permits" value={location.permitRequired ? 'Required' : 'Not Required'} />
                          <div className="pt-6 border-t border-earth-800">
                             <p className="text-[10px] font-black text-earth-700 uppercase mb-3">Hazard Warnings</p>
                             <div className="p-5 bg-red-950/20 border border-red-900/30 rounded-2xl flex gap-4">
                                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                                <p className="text-sm font-medium text-earth-200 leading-relaxed italic">{location.hazardWarnings || 'Standard outdoor precautions.'}</p>
                             </div>
                          </div>
                       </div>
                    </section>
                 </div>
               )}
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <section className="bg-mineral-teal rounded-[2.5rem] p-8 text-earth-50 shadow-xl relative overflow-hidden border border-white/10">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                 <Cloud className="w-24 h-24" />
               </div>
               <div className="relative z-10">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-earth-50/60 mb-6">Site Conditions</h3>
                 {weather ? (
                   <div className="space-y-6">
                      <div className="flex items-center gap-6">
                        <span className="text-5xl font-black italic tracking-tighter">{(weather as any).temp}°</span>
                        <div>
                          <p className="text-lg font-black uppercase leading-none">{(weather as any).summary}</p>
                          <p className="text-earth-50/60 text-[10px] font-bold uppercase tracking-widest mt-1">Updated recently</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-earth-950/20 p-4 rounded-2xl border border-white/10">
                           <div className="flex items-center gap-2 mb-1">
                              <Droplets className="w-3 h-3" />
                              <p className="text-[10px] font-black uppercase">Rain</p>
                           </div>
                           <p className="text-sm font-black">{(weather as any).precipitation}</p>
                        </div>
                        <div className="bg-earth-950/20 p-4 rounded-2xl border border-white/10">
                           <div className="flex items-center gap-2 mb-1">
                              <Wind className="w-3 h-3" />
                              <p className="text-[10px] font-black uppercase">Wind</p>
                           </div>
                           <p className="text-sm font-black">{(weather as any).wind}</p>
                        </div>
                      </div>
                   </div>
                 ) : (
                   <div className="animate-pulse space-y-4">
                      <div className="h-16 bg-earth-950/20 rounded-2xl" />
                      <div className="h-12 bg-earth-950/20 rounded-2xl" />
                   </div>
                 )}
               </div>
            </section>

            <section className="bg-earth-900 rounded-[2.5rem] p-8 border border-earth-700 shadow-sm">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-earth-950 rounded-2xl flex items-center justify-center border border-earth-700 text-earth-50">
                     <Navigation className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="font-black text-earth-50 uppercase text-xs">Coordinates</h3>
                     <p className="text-[10px] font-mono font-bold text-earth-400">{location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}</p>
                  </div>
               </div>
               <a 
                 href={`https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`}
                 target="_blank"
                 rel="noreferrer"
                 className="w-full bg-earth-950 hover:bg-earth-800 text-earth-50 py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all border border-earth-700"
               >
                  Get Directions <ArrowRight className="w-4 h-4" />
               </a>
            </section>
          </aside>
        </div>
      </div>

      {showCheckinModal && (
        <SafetyCheckinModal 
          onClose={() => setShowCheckinModal(false)}
          onSuccess={() => setShowCheckinModal(false)}
          locationId={location._id}
          locationName={location.name}
        />
      )}
      
      {showLogModal && (
        <div className="fixed inset-0 bg-earth-950/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-6">
           <div className="bg-earth-900 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-earth-700">
              <h3 className="text-2xl font-black text-earth-50 uppercase italic tracking-tighter mb-4 text-center">Log Discovery</h3>
              <p className="text-earth-400 font-medium text-center mb-8 italic">Find logging is coming soon.</p>
              <button 
                onClick={() => setShowLogModal(false)}
                className="w-full bg-mineral-teal text-earth-50 py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                Close
              </button>
           </div>
        </div>
      )}
    </div>
  )
}

function TabBtn({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative shrink-0 ${
        active ? 'text-earth-50' : 'text-earth-700 hover:text-earth-400'
      }`}
    >
      {label}
      {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-mineral-teal rounded-full shadow-[0_0_10px_rgba(61,107,107,0.5)]" />}
    </button>
  )
}

function AccessItem({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
   return (
      <div className="flex justify-between items-end">
         <div>
            <p className="text-[10px] font-black text-earth-700 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-sm font-black uppercase italic leading-none ${highlight ? 'text-mineral-teal' : 'text-earth-50'}`}>{value}</p>
         </div>
         <ChevronRight className="w-4 h-4 text-earth-800" />
      </div>
   )
}
