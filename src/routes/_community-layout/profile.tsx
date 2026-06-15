import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useState } from 'react'
import { 
  User, 
  MapPin, 
  Camera, 
  Heart, 
  ShieldCheck, 
  ChevronRight, 
  LogOut,
  Edit3,
  Zap,
  Award,
  Map,
  Users,
  Grid,
  FileText,
  Plus,
  MessageSquare
} from 'lucide-react'
import { useAuthActions } from "@convex-dev/auth/react";

export const Route = createFileRoute('/_community-layout/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { data: profile } = useSuspenseQuery(convexQuery(api.users.viewer, {}))
  const { data: idents } = useSuspenseQuery(convexQuery(api.ai.getMyIdentifications, {}))
  const { signOut } = useAuthActions();
  const checkout = useMutation(api.safety.checkOut)
  
  const [activeTab, setActiveTab] = useState<'posts' | 'finds' | 'collections' | 'saved' | 'passport' | 'ai'>('posts')

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-earth-950">
       <div className="w-20 h-20 bg-earth-800 rounded-3xl mb-6 animate-pulse" />
       <h1 className="text-2xl font-black uppercase italic text-earth-50 mb-2">Member Portal</h1>
       <p className="text-earth-400 font-medium mb-8 text-center max-w-xs leading-relaxed italic">Sign in to track your finds, save favorite locations, and connect with the community.</p>
       <Link to="/auth" className="bg-mineral-teal text-earth-50 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-mineral-teal-hover transition-all">
         Sign In / Join
       </Link>
    </div>
  )

  const { user, favorites, findReports, activeCheckins, posts } = profile

  return (
    <div className="min-h-screen bg-earth-950 pb-24">
      {/* Profile Header / Banner */}
      <div className="relative h-64 md:h-80 bg-earth-900 overflow-hidden border-b border-earth-700">
        {user.bannerImage ? (
          <img src={user.bannerImage} className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-earth-900 via-earth-800 to-mineral-teal/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-earth-950 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="relative -mt-24 mb-8 flex flex-col md:flex-row items-end gap-6">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[3rem] bg-earth-950 overflow-hidden border-4 border-earth-950 shadow-2xl relative">
              {user.image ? (
                <img src={user.image} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-earth-900">
                  <User className="w-16 h-16 text-earth-700" />
                </div>
              )}
            </div>
            <button className="absolute bottom-2 right-2 bg-mineral-teal text-earth-50 p-3 rounded-2xl shadow-xl border-2 border-earth-950 hover:bg-mineral-teal-hover transition-all">
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <h1 className="text-4xl font-black text-earth-50 uppercase italic tracking-tighter">{user.name || 'Hobbyist'}</h1>
              <p className="text-xl font-bold text-earth-400">@{user.username || 'explorer'}</p>
            </div>
            <div className="flex flex-wrap gap-6 text-earth-500 font-bold text-[10px] uppercase tracking-widest">
               <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-mineral-teal" />
                  {user.location || user.homeRegion || 'Washington'}
               </div>
               <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-mineral-copper" />
                  Level 14 Prospector
               </div>
               <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-mineral-green" />
                  {user.followerCount || 0} Followers • {user.followingCount || 0} Following
               </div>
            </div>
          </div>

          <div className="flex gap-3 pb-2">
             <button className="bg-earth-800 hover:bg-earth-700 text-earth-50 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] border border-earth-700 transition-all flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Edit
             </button>
             <button onClick={() => signOut()} className="bg-red-950/20 hover:bg-red-950/40 text-red-500 p-3 rounded-xl border border-red-900/30 transition-all">
                <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <aside className="lg:col-span-4 space-y-8">
              <section className="bg-earth-900 border border-earth-700 rounded-[2.5rem] p-8 shadow-xl">
                 <h3 className="text-xs font-black text-earth-400 uppercase tracking-[0.2em] mb-6">Field Journal</h3>
                 <p className="text-earth-200 text-sm font-medium leading-relaxed italic mb-8">
                    "{user.bio || 'Professional rockhound and mineral collector. Always looking for the next pocket of crystal quartz.'}"
                 </p>
                 
                 <div className="space-y-6">
                    <div>
                       <p className="text-[10px] font-black text-earth-700 uppercase mb-3">Favorite Minerals</p>
                       <div className="flex flex-wrap gap-2">
                          {['Agate', 'Amethyst', 'Jade'].map(m => (
                            <span key={m} className="bg-earth-950 border border-earth-800 px-3 py-1 rounded-lg text-[9px] font-black text-earth-400 uppercase">{m}</span>
                          ))}
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-earth-700 uppercase mb-3">Collecting Style</p>
                       <p className="text-xs font-bold text-earth-200">Riverbed Surface, Hard-rock Mining</p>
                    </div>
                 </div>
              </section>

              <div className="grid grid-cols-2 gap-4">
                 <StatBox label="Finds" value={findReports.length} />
                 <StatBox label="Spots" value={favorites.length + 2} />
                 <StatBox label="Posts" value={posts.length} />
                 <StatBox label="Trips" value={4} />
              </div>

              {activeCheckins.length > 0 && (
                <section className="bg-mineral-teal rounded-[2rem] p-6 text-earth-50 shadow-xl border border-white/10">
                   <div className="flex items-center gap-3 mb-4">
                      <ShieldCheck className="w-5 h-5" />
                      <h4 className="font-black uppercase italic text-xs">Active Check-in</h4>
                   </div>
                   <p className="text-lg font-black uppercase leading-tight mb-4">{activeCheckins[0].locationName}</p>
                   <button onClick={() => checkout({ checkinId: activeCheckins[0]._id })} className="w-full bg-white text-mineral-teal py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">End Session</button>
                </section>
              )}
           </aside>

           <main className="lg:col-span-8 space-y-6">
              <div className="flex gap-6 border-b border-earth-700 overflow-x-auto scrollbar-hide">
                 <TabNav active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} label="Posts" />
                 <TabNav active={activeTab === 'finds'} onClick={() => setActiveTab('finds')} label="Finds" />
                 <TabNav active={activeTab === 'collections'} onClick={() => setActiveTab('collections')} label="Collections" />
                 <TabNav active={activeTab === 'saved'} onClick={() => setActiveTab('saved')} label="Saved" />
                 <TabNav active={activeTab === 'passport'} onClick={() => setActiveTab('passport')} label="Passport" />
                 <TabNav active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} label="AI Results" />
              </div>

              <div className="pt-4">
                 {activeTab === 'posts' && (
                   <div className="space-y-6">
                      {posts.length === 0 ? (
                        <div className="py-20 text-center bg-earth-900 rounded-[2.5rem] border border-earth-700 border-dashed">
                           <FileText className="w-12 h-12 text-earth-800 mx-auto mb-4" />
                           <p className="text-earth-400 font-bold uppercase text-xs">No posts yet</p>
                        </div>
                      ) : (
                        posts.map(post => (
                          <div key={post._id} className="bg-earth-900 border border-earth-700 rounded-[2.5rem] p-6 shadow-sm">
                             <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black text-earth-700 uppercase tracking-widest">{new Date(post._creationTime).toLocaleDateString()}</p>
                                <span className="text-[8px] font-black text-mineral-teal uppercase bg-mineral-teal/10 px-2 py-0.5 rounded italic">{post.type}</span>
                             </div>
                             <p className="text-earth-50 text-sm font-medium leading-relaxed mb-4">{post.content}</p>
                             <div className="flex items-center gap-6 pt-4 border-t border-earth-800">
                                <div className="flex items-center gap-2 text-earth-700 text-[10px] font-black uppercase">
                                   <Heart className="w-4 h-4" /> {post.likeCount || 0}
                                </div>
                                <div className="flex items-center gap-2 text-earth-700 text-[10px] font-black uppercase">
                                   <MessageSquare className="w-4 h-4" /> {post.commentCount || 0}
                                </div>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                 )}

                 {activeTab === 'finds' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {findReports.map(report => (
                        <div key={report._id} className="bg-earth-900 border border-earth-700 rounded-[2rem] overflow-hidden group hover:border-mineral-teal transition-all">
                           <div className="aspect-square bg-earth-950 relative overflow-hidden">
                              {report.photoUrls?.[0] && <img src={report.photoUrls[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                              <div className="absolute top-4 left-4 bg-earth-950/60 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-earth-50 uppercase tracking-widest">{report.locationName}</div>
                           </div>
                           <div className="p-5">
                              <h4 className="font-black text-earth-50 uppercase text-sm mb-1">{report.mineralName}</h4>
                              <p className="text-[10px] font-bold text-earth-400 uppercase">{new Date(report.dateFound).toLocaleDateString()}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}

                 {activeTab === 'collections' && (
                   <div className="py-20 text-center bg-earth-900 rounded-[2.5rem] border border-earth-700 border-dashed">
                      <Grid className="w-12 h-12 text-earth-800 mx-auto mb-4" />
                      <p className="text-earth-400 font-bold uppercase text-xs mb-6 italic">Organize your best specimens into curated collections.</p>
                      <button className="bg-mineral-teal text-earth-50 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-mineral-teal-hover transition-all flex items-center gap-2 mx-auto">
                        <Plus className="w-4 h-4" /> Create Collection
                      </button>
                   </div>
                 )}

                 {activeTab === 'saved' && (
                    <div className="grid grid-cols-1 gap-4">
                      {favorites.map(loc => (
                        <Link 
                          key={loc?._id} 
                          to="/locations/$locationId" 
                          params={{ locationId: loc?._id as string }}
                          className="bg-earth-900 border border-earth-700 rounded-[2rem] p-6 flex items-center justify-between group hover:border-mineral-teal transition-all"
                        >
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 rounded-2xl bg-earth-800 overflow-hidden border border-earth-700">
                                 {loc?.photos?.[0] && <img src={loc.photos[0]} className="w-full h-full object-cover" />}
                              </div>
                              <div>
                                 <h4 className="font-black text-earth-50 uppercase italic text-lg leading-tight mb-1">{loc?.name}</h4>
                                 <p className="text-earth-400 text-[10px] font-bold uppercase tracking-widest">{loc?.region}, {loc?.state}</p>
                              </div>
                           </div>
                           <ChevronRight className="w-6 h-6 text-earth-700 group-hover:text-mineral-teal transition-all" />
                        </Link>
                      ))}
                    </div>
                 )}

                 {activeTab === 'passport' && (
                    <div className="space-y-8">
                       <section className="bg-earth-900 border border-earth-700 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-10">
                             <Map className="w-32 h-32" />
                          </div>
                          <div className="relative z-10">
                             <h3 className="text-2xl font-black text-earth-50 uppercase italic tracking-tighter mb-6">Exploration Map</h3>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Badge icon="🏔️" label="Mountain King" count={3} />
                                <Badge icon="🌊" label="Coast Watcher" count={2} />
                                <Badge icon="🏜️" label="Desert Rat" count={0} />
                                <Badge icon="⚒️" label="Mine Veteran" count={1} />
                             </div>
                          </div>
                       </section>
                    </div>
                 )}

                 {activeTab === 'ai' && (
                   <div className="space-y-6">
                      {idents.map(id => (
                        <div key={id._id} className="bg-earth-900 border border-earth-700 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-xl">
                           <div className="w-full md:w-48 h-48 flex-none bg-earth-950">
                              <img src={(id as any).imageUrl || ''} className="w-full h-full object-cover" />
                           </div>
                           <div className="p-6 flex-1">
                              <div className="flex items-center gap-2 mb-4">
                                 <Zap className="w-4 h-4 text-mineral-teal" />
                                 <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest">AI Identification • {new Date(id._creationTime).toLocaleDateString()}</p>
                              </div>
                              <p className="text-earth-200 text-sm font-medium italic leading-relaxed line-clamp-3">{id.result as string}</p>
                              </div>
                              </div>
                              ))}
                   </div>
                 )}
              </div>
           </main>
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string, value: number }) {
   return (
      <div className="bg-earth-900 border border-earth-700 rounded-3xl p-5 text-center shadow-lg">
         <p className="text-2xl font-black text-earth-50 italic leading-none mb-1">{value}</p>
         <p className="text-[9px] font-black text-earth-700 uppercase tracking-widest">{label}</p>
      </div>
   )
}

function TabNav({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
   return (
      <button 
        onClick={onClick} 
        className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative shrink-0 ${active ? 'text-earth-50' : 'text-earth-700 hover:text-earth-400'}`}
      >
         {label}
         {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-mineral-teal rounded-full shadow-[0_0_10px_rgba(61,107,107,0.5)]" />}
      </button>
   )
}

function Badge({ icon, label, count }: { icon: string, label: string, count: number }) {
   return (
      <div className={`p-4 rounded-2xl border text-center transition-all ${count > 0 ? 'bg-earth-950 border-earth-800' : 'bg-earth-950/30 border-earth-900 opacity-40 grayscale'}`}>
         <div className="text-2xl mb-2">{icon}</div>
         <p className="text-[8px] font-black text-earth-50 uppercase leading-none mb-1">{label}</p>
         <p className="text-[8px] font-bold text-earth-700 uppercase">{count} sites</p>
      </div>
   )
}
