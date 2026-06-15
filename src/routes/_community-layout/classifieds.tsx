import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import { useState } from 'react'
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Camera,
  MapPin,
  Clock,
  MessageSquare
} from 'lucide-react'

export const Route = createFileRoute('/_community-layout/classifieds')({
  component: ClassifiedsPage,
})

const CATEGORIES = [
  "All",
  "Rocks & Minerals",
  "Fossils",
  "Lapidary",
  "Equipment",
  "Claims & Access",
  "Experiences",
  "Wanted Ads"
]

function ClassifiedsPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: ads } = useSuspenseQuery(
    convexQuery(api.classifieds.list, { 
      category: activeCategory === 'All' ? undefined : activeCategory 
    })
  )

  return (
    <div className="min-h-screen bg-earth-950 pb-24">
      {/* Search & Categories */}
      <header className="bg-earth-900 border-b border-earth-700 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
               <h1 className="text-4xl font-black text-earth-50 uppercase italic tracking-tighter">Marketplace</h1>
               <p className="text-earth-400 font-medium uppercase text-[10px] tracking-[0.3em] mt-1">Buy, Sell & Trade</p>
            </div>
            
            <button className="bg-mineral-teal text-earth-50 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-mineral-teal-hover transition-all flex items-center gap-3">
              <Plus className="w-4 h-4" /> Post Your Ad
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
             <div className="flex-1 w-full relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-400" />
                <input 
                  type="text" 
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-earth-950 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-earth-50 focus:ring-2 focus:ring-mineral-teal transition-all shadow-inner"
                />
             </div>
             
             <div className="flex-none flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-none px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      activeCategory === cat 
                      ? 'bg-mineral-teal border-mineral-teal text-earth-50 shadow-xl' 
                      : 'bg-earth-950 border-earth-700 text-earth-400 hover:border-earth-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {ads.length === 0 ? (
             <div className="col-span-full py-32 text-center bg-earth-900 rounded-[2.5rem] border-2 border-dashed border-earth-700">
               <ShoppingBag className="w-16 h-16 text-earth-700 mx-auto mb-4" />
               <h3 className="text-xl font-black text-earth-50 uppercase italic">No listings found</h3>
               <p className="text-earth-400 font-medium mt-2">Be the first to post something in this category!</p>
             </div>
           ) : (
             ads.map(ad => (
               <div key={ad._id} className="bg-earth-900 rounded-[2rem] overflow-hidden border border-earth-700 group hover:border-mineral-teal transition-all hover:shadow-2xl">
                 <div className="h-64 relative overflow-hidden bg-earth-950">
                   {ad.imageUrls?.[0] ? (
                     <img src={ad.imageUrls[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-earth-700">
                        <Camera className="w-12 h-12" />
                     </div>
                   )}
                   <div className="absolute top-4 right-4 bg-mineral-copper/90 backdrop-blur text-earth-50 px-4 py-2 rounded-xl font-black text-sm italic">
                     ${ad.price}
                   </div>
                   <div className="absolute bottom-4 left-4 flex gap-2">
                      <span className="bg-mineral-teal text-earth-50 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">
                        {ad.category}
                      </span>
                   </div>
                 </div>
                 
                 <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-black text-earth-50 uppercase text-lg leading-tight group-hover:text-mineral-teal transition-colors">{ad.title}</h3>
                    </div>
                    
                    <div className="flex items-center gap-4 text-earth-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                       <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {ad.state}
                       </div>
                       <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ad._creationTime).toLocaleDateString()}
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-earth-700">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-earth-950 border border-earth-700" />
                          <span className="text-[10px] font-black text-earth-50 uppercase">{ad.sellerName || 'Hobbyist'}</span>
                       </div>
                       <button className="bg-earth-950 p-3 rounded-xl text-earth-400 hover:text-mineral-teal hover:bg-earth-800 transition-all">
                          <MessageSquare className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  )
}
