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
  AlertTriangle
} from 'lucide-react'
import SafetyCheckinModal from '~/components/SafetyCheckinModal'

export const Route = createFileRoute('/locations/$locationId')({
  component: LocationDetail,
})

function LocationDetail() {
  const { locationId } = useParams({ from: '/locations/$locationId' })
  const { data: details } = useSuspenseQuery(convexQuery(api.locationActivity.getLocationDetails, { locationId: locationId as any }))
  
  const [activeTab, setActiveTab] = useState<'intel' | 'finds' | 'community'>('intel')
  const [showCheckinModal, setShowCheckinModal] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)

  if (!details) return <div>Location not found</div>

  const { location, weather, findReports, minerals } = details
  const regionSlug = location.region?.toLowerCase().replace(/\s+/g, '-') || 'general'

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Immersive Header */}
      <div className="h-[50vh] md:h-[60vh] relative overflow-hidden bg-stone-900">
        <img 
          src={location.photos[0]} 
          className="w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/20 to-transparent" />
        
        <div className="absolute top-8 left-6 right-6 flex justify-between items-center z-10">
          <Link to="/" className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </Link>
          <div className="flex gap-3">
             <button className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all">
                <Heart className="w-5 h-5" />
             </button>
             <button className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all">
                <Share2 className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="absolute bottom-12 left-6 right-6">
          <div className="max-w-6xl mx-auto">
             <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                  {location.landStatus}
                </span>
                <span className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {location.accessType || 'Public'}
                </span>
             </div>
             <h1 className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">
                {location.name}
             </h1>
             <div className="flex items-center gap-6 text-white/60 font-bold uppercase text-xs tracking-widest">
                <div className="flex items-center gap-2">
                   <MapPin className="w-4 h-4 text-emerald-400" />
                   {location.region}, {location.state}
                </div>
                <div className="flex items-center gap-2">
                   <Navigation className="w-4 h-4 text-emerald-400" />
                   {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Action Bar */}
            <div className="bg-white p-4 rounded-[2rem] shadow-xl border border-stone-100 flex flex-wrap gap-4">
              <button 
                onClick={() => setShowCheckinModal(true)}
                className="flex-1 min-w-[200px] bg-stone-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-stone-800 transition-all flex items-center justify-center gap-3"
              >
                <ShieldAlert className="w-5 h-5 text-emerald-400" /> Safety Check-In
              </button>
              <div className="flex-none flex gap-2">
                <div className="bg-stone-50 px-6 py-4 rounded-[1.5rem] flex flex-col justify-center">
                   <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Difficulty</span>
                   <span className="text-lg font-black text-stone-900 italic leading-none">{location.difficulty}/5</span>
                </div>
                <div className="bg-stone-50 px-6 py-4 rounded-[1.5rem] flex flex-col justify-center">
                   <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Road</span>
                   <span className="text-lg font-black text-stone-900 italic leading-none">{location.roadAccessibility}/5</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-8 border-b border-stone-200 px-4">
               <TabButton active={activeTab === 'intel'} onClick={() => setActiveTab('intel')} label="Site Intel" />
               <TabButton active={activeTab === 'finds'} onClick={() => setActiveTab('finds')} label="Discoveries" />
               <TabButton active={activeTab === 'community'} onClick={() => setActiveTab('community')} label="Hub Discussion" />
            </div>

            {activeTab === 'intel' && (
              <>
                <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-stone-100 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                      <Zap className="w-64 h-64" />
                   </div>
                   
                   <div className="relative z-10">
                     <h2 className="text-4xl font-black text-stone-900 uppercase italic tracking-tighter mb-8">The Geology</h2>
                     <p className="text-stone-600 text-xl font-medium leading-relaxed italic mb-12">
                       "{location.description}"
                     </p>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] flex items-center gap-3">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Best Finds
                           </h4>
                           <div className="flex flex-wrap gap-2">
                              {location.typicalFinds.map(find => (
                                <span key={find} className="bg-stone-50 text-stone-900 border border-stone-200 px-4 py-2 rounded-xl text-xs font-black uppercase">
                                  {find}
                                </span>
                              ))}
                           </div>
                        </div>
                        <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100">
                           <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <Zap className="w-3 h-3 text-amber-500" /> Pro Tip
                           </h4>
                           <p className="text-sm font-bold text-stone-800 leading-snug">{location.parkingInfo}</p>
                        </div>
                     </div>
                   </div>
                </section>

                <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-stone-100">
                   <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white">
                      <Dna className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-stone-900 uppercase italic tracking-tighter">Mineral Profile</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {minerals.map(mineral => (
                      <Link 
                        key={mineral._id}
                        to="/minerals/$mineralId"
                        params={{ mineralId: mineral._id }}
                        className="group bg-stone-50 p-6 rounded-3xl border border-stone-200 hover:border-emerald-500 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                              {mineral.detail?.photos?.[0] ? (
                                <img src={mineral.detail.photos[0]} className="w-full h-full object-cover" />
                              ) : (
                                <Dna className="w-6 h-6 text-stone-300" />
                              )}
                           </div>
                           <div>
                              <h3 className="font-black text-stone-900 uppercase text-sm">{mineral.detail?.name || 'Unknown'}</h3>
                              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{mineral.detail?.hardness || '?' } Hardness</p>
                           </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-emerald-600 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'finds' && (
              <section className="space-y-6">
                <div className="flex justify-between items-center px-4">
                  <h2 className="text-2xl font-black text-stone-900 uppercase italic tracking-tighter">Recent Discoveries</h2>
                  <button 
                    onClick={() => setShowLogModal(true)}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Log a Find
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {findReports.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-stone-200">
                      <Camera className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                      <p className="text-stone-400 font-bold uppercase text-xs tracking-widest">No finds logged yet. Be the first!</p>
                    </div>
                  ) : (
                    findReports.map(report => (
                      <div key={report._id} className="bg-white rounded-[2.5rem] overflow-hidden border border-stone-100 shadow-sm group">
                        <div className="aspect-square relative overflow-hidden bg-stone-100">
                           {report.photoUrls?.[0] && (
                             <img 
                              src={report.photoUrls[0]} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                             />
                           )}
                           <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                             {new Date(report._creationTime).toLocaleDateString()}
                           </div>
                        </div>
                        <div className="p-6">
                           <div className="flex items-center gap-2 mb-2">
                             <div className="w-6 h-6 rounded-full bg-stone-200 overflow-hidden">
                                {report.user?.image && <img src={report.user.image} />}
                             </div>
                             <span className="text-[10px] font-black uppercase text-stone-400">{report.user?.name || 'Explorer'}</span>
                           </div>
                           <h3 className="font-black text-stone-900 uppercase text-lg mb-2">{report.mineralName}</h3>
                           <p className="text-stone-500 text-sm font-medium line-clamp-2 italic">"{report.description}"</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            {activeTab === 'community' && (
               <section className="bg-stone-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <MessageSquare className="w-48 h-48" />
                  </div>
                  <div className="relative z-10 max-w-lg">
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-6">Regional Community</h2>
                    <p className="text-stone-400 font-medium text-lg mb-8 leading-relaxed">
                      Join the discussion for the <span className="text-white">{location.region}</span> region. Share site updates, coordinate carpools, and swap trade secrets.
                    </p>
                    <Link 
                      to="/chat/$roomSlug"
                      params={{ roomSlug: regionSlug }}
                      className="inline-flex items-center gap-4 bg-emerald-500 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-emerald-400 transition-all group"
                    >
                      Enter Regional Chat
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
               </section>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Weather Card */}
            <section className="bg-emerald-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                 <Cloud className="w-24 h-24" />
               </div>
               <div className="relative z-10">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 mb-6">Site Conditions</h3>
                 
                 {weather ? (
                   <div className="space-y-6">
                      <div className="flex items-center gap-6">
                        <span className="text-5xl font-black italic tracking-tighter">{weather.temp}°</span>
                        <div>
                          <p className="text-lg font-black uppercase leading-none">{weather.summary}</p>
                          <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Temp: {weather.temp}°</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <Droplets className="w-5 h-5 text-emerald-300" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Rain</p>
                            <p className="text-sm font-bold">{weather.precipitation}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <Wind className="w-5 h-5 text-emerald-300" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Wind</p>
                            <p className="text-sm font-bold">{weather.wind}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-emerald-800/50 rounded-2xl border border-emerald-700">
                        <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-2">Hounders Advisory</p>
                        <p className="text-sm font-medium leading-tight">
                          {weather.precipitation 
  ? (parseFloat(weather.precipitation) > 0
    ? "Wet conditions will make agates pop, but watch your footing on steep riverbanks." 
    : "Clear skies today. Perfect for high-elevation prospecting near the ridges.")
  : "Check local conditions before heading out."}
                        </p>
                      </div>
                   </div>
                 ) : (
                   <div className="animate-pulse space-y-4">
                     <div className="h-12 bg-emerald-800 rounded-xl w-3/4"></div>
                     <div className="h-24 bg-emerald-800 rounded-xl"></div>
                   </div>
                 )}
               </div>
            </section>

            {/* Map Deep Link */}
            <section className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-white">
                   <MapPin className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="font-black text-stone-900 uppercase text-xs">GPS Coordinates</h3>
                   <p className="text-[10px] font-mono font-bold text-stone-400">{location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}</p>
                 </div>
               </div>
               
               <a 
                 href={`https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`}
                 target="_blank"
                 rel="noreferrer"
                 className="flex items-center justify-center gap-3 w-full bg-stone-100 hover:bg-stone-200 text-stone-900 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
               >
                 Navigate to Site <ArrowRight className="w-4 h-4" />
               </a>
            </section>

            {/* Access Intelligence */}
            <section className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-6">Access Profile</h3>
               
               <div className="space-y-6">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Terrain</p>
                        <p className="text-sm font-black text-stone-900 uppercase italic leading-none">{location.terrain || 'Public Access'}</p>
                     </div>
                     <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  
                  <div className="pt-6 border-t border-stone-100">
                     <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Hazard Warnings</p>
                     <p className="text-xs font-bold text-stone-500 italic leading-relaxed">
                        {location.hazardWarnings || 'Standard outdoor precautions apply. Watch for loose rock and tick activity in high brush.'}
                     </p>
                  </div>
               </div>
            </section>
          </div>
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
      
      {/* Placeholder for Log Find Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-6">
           <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-black text-stone-900 uppercase italic tracking-tighter mb-4 text-center">Log Discovery</h3>
              <p className="text-stone-500 font-medium text-center mb-8 italic">Find logging is coming soon to the immersive mobile experience.</p>
              <button 
                onClick={() => setShowLogModal(false)}
                className="w-full bg-stone-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                Close
              </button>
           </div>
        </div>
      )}
    </div>
  )
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
        active ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'
      }`}
    >
      {label}
      {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />}
    </button>
  )
}
