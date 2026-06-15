import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useState } from 'react'
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  MapPin, 
  Camera, 
  Zap, 
  TrendingUp, 
  Users, 
  Image as ImageIcon,
  MoreHorizontal,
  ChevronRight,
  Award
} from 'lucide-react'

export const Route = createFileRoute('/_community-layout/')({
  component: SocialFeedPage,
})

function SocialFeedPage() {
  const { data: profile } = useSuspenseQuery(convexQuery(api.users.viewer, {}))
  const { data: feed } = useSuspenseQuery(convexQuery(api.social.listFeed, { limit: 20 }))
  const { data: trending } = useSuspenseQuery(convexQuery(api.social.getTrending, {}))
  
  const createPost = useMutation(api.social.createPost)
  const toggleLike = useMutation(api.social.toggleLike)
  
  const [postContent, setPostContent] = useState('')
  const [postType, setPostType] = useState('discussion')
  const [isPosting, setIsPosting] = useState(false)

  const handleCreatePost = async () => {
    if (!postContent.trim()) return
    setIsPosting(true)
    try {
      await createPost({
        type: postType,
        content: postContent,
        region: profile?.user?.homeRegion || 'Washington'
      })
      setPostContent('')
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="min-h-screen bg-earth-950 pb-24 lg:pt-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar: User Quick Profile & Groups (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            {profile?.user && (
              <div className="bg-earth-900 border border-earth-700 rounded-[2rem] p-6 shadow-xl overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-earth-800 overflow-hidden border border-earth-700">
                    {profile.user.image && <img src={profile.user.image} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <h3 className="font-black text-earth-50 uppercase text-sm leading-tight">{profile.user.name || 'Hobbyist'}</h3>
                    <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest">@{profile.user.username || 'rockhound'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 py-4 border-y border-earth-800">
                   <div className="text-center">
                      <p className="text-xs font-black text-earth-50">{profile.findReports.length}</p>
                      <p className="text-[8px] font-black text-earth-700 uppercase">Finds</p>
                   </div>
                   <div className="text-center border-x border-earth-800">
                      <p className="text-xs font-black text-earth-50">{profile.user.followerCount || 0}</p>
                      <p className="text-[8px] font-black text-earth-700 uppercase">Followers</p>
                   </div>
                   <div className="text-center">
                      <p className="text-xs font-black text-earth-50">4.8k</p>
                      <p className="text-[8px] font-black text-earth-700 uppercase">Rank</p>
                   </div>
                </div>
                <Link to="/profile" className="mt-6 block w-full text-center py-3 bg-earth-800 hover:bg-earth-700 border border-earth-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-earth-400 transition-all">
                   View Profile
                </Link>
              </div>
            )}

            <div className="bg-earth-900 border border-earth-700 rounded-[2rem] p-6 shadow-xl">
               <h3 className="text-xs font-black text-earth-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <Users className="w-4 h-4 text-mineral-teal" /> Your Communities
               </h3>
               <div className="space-y-4">
                  {trending.groups.map(group => (
                    <Link key={group._id} to="/" className="flex items-center gap-3 group">
                       <div className="w-8 h-8 rounded-lg bg-earth-800 flex items-center justify-center border border-earth-700 text-earth-700 group-hover:text-mineral-teal transition-colors">
                          <Users className="w-4 h-4" />
                       </div>
                       <span className="text-[10px] font-black text-earth-200 uppercase group-hover:text-earth-50 transition-colors truncate">{group.name}</span>
                    </Link>
                  ))}
               </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="lg:col-span-6 space-y-6">
            
            {/* Create Post Card */}
            <section className="bg-earth-900 border border-earth-700 rounded-[2.5rem] p-6 shadow-xl">
               <div className="flex gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-earth-800 flex-none border border-earth-700 overflow-hidden">
                     {profile?.user?.image && <img src={profile.user.image} className="w-full h-full object-cover" />}
                  </div>
                  <textarea 
                    placeholder="Share your latest discovery or trip report..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-earth-50 placeholder:text-earth-700 resize-none py-2 text-sm font-medium min-h-[80px]"
                  />
               </div>
               <div className="flex items-center justify-between pt-4 border-t border-earth-800">
                  <div className="flex gap-2">
                     <button className="p-2 text-earth-700 hover:text-mineral-teal transition-colors" title="Add Image">
                        <ImageIcon className="w-5 h-5" />
                     </button>
                     <button className="p-2 text-earth-700 hover:text-mineral-copper transition-colors" title="Tag Location">
                        <MapPin className="w-5 h-5" />
                     </button>
                     <select 
                        value={postType} 
                        onChange={(e) => setPostType(e.target.value)}
                        className="bg-earth-800 border-none rounded-lg text-[10px] font-black uppercase text-earth-400 focus:ring-1 focus:ring-mineral-teal py-1 pl-2 pr-8"
                     >
                        <option value="discussion">Discussion</option>
                        <option value="find">Find Report</option>
                        <option value="trip_report">Trip Report</option>
                        <option value="educational">Educational</option>
                     </select>
                  </div>
                  <button 
                    onClick={handleCreatePost}
                    disabled={isPosting || !postContent.trim()}
                    className="bg-mineral-teal text-earth-50 px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-mineral-teal-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPosting ? 'Posting...' : 'Post'}
                  </button>
               </div>
            </section>

            {/* Feed Filter (Optional Mobile) */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
               {['All Content', 'Nearby', 'Friends', 'Educational', 'Market'].map(filter => (
                 <button key={filter} className={`flex-none px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${filter === 'All Content' ? 'bg-mineral-teal border-mineral-teal text-earth-50' : 'bg-earth-900 border-earth-700 text-earth-700 hover:border-earth-400'}`}>
                    {filter}
                 </button>
               ))}
            </div>

            {/* Scrolling Feed */}
            <div className="space-y-6">
               {feed.length === 0 ? (
                 <div className="py-20 text-center bg-earth-900 rounded-[2.5rem] border border-earth-700 border-dashed">
                    <Zap className="w-12 h-12 text-earth-800 mx-auto mb-4" />
                    <p className="text-earth-400 font-bold uppercase text-xs">No posts in your area yet. Start the conversation!</p>
                 </div>
               ) : (
                 feed.map(post => (
                   <PostCard key={post._id} post={post} onLike={() => toggleLike({ postId: post._id })} />
                 ))
               )}
            </div>
          </main>

          {/* Right Sidebar: Trending & Discovery */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
             <section className="bg-earth-900 border border-earth-700 rounded-[2rem] p-6 shadow-xl">
                <h3 className="text-xs font-black text-earth-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-mineral-copper" /> Trending Minerals
                </h3>
                <div className="space-y-4">
                   {trending.minerals.map(mineral => (
                     <div key={mineral._id} className="flex items-center justify-between group cursor-pointer">
                        <div>
                           <p className="text-[10px] font-black text-earth-50 uppercase">{mineral.name}</p>
                           <p className="text-[8px] font-bold text-earth-700 uppercase">1.2k Discoveries</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-earth-800 group-hover:text-mineral-teal transition-colors" />
                     </div>
                   ))}
                </div>
             </section>

             <section className="bg-earth-900 border border-earth-700 rounded-[2rem] p-6 shadow-xl">
                <h3 className="text-xs font-black text-earth-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-mineral-green" /> Top Regions
                </h3>
                <div className="space-y-4">
                   {['Hansen Creek', 'Ocean Shores', 'Richardson Ranch', 'Topaz Mountain'].map(spot => (
                     <div key={spot} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-mineral-green" />
                        <span className="text-[10px] font-black text-earth-200 uppercase">{spot}</span>
                     </div>
                   ))}
                </div>
             </section>

             <section className="bg-mineral-teal rounded-[2rem] p-6 text-earth-50 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Award className="w-16 h-16" />
                </div>
                <h4 className="font-black uppercase italic text-xs mb-2">Member Highlight</h4>
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-full bg-earth-50/20 border border-white/20" />
                   <p className="text-[10px] font-black uppercase">AgateQueen</p>
                </div>
                <p className="text-[10px] font-medium leading-relaxed italic mb-4">"Found a massive water-bubble agate at Damon Point this weekend!"</p>
                <button className="w-full bg-white text-mineral-teal py-2 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg">View Post</button>
             </section>
          </aside>

        </div>
      </div>
    </div>
  )
}

function PostCard({ post, onLike }: { post: any, onLike: () => void }) {
  const [liked, setLiked] = useState(post.isLiked)
  const [likes, setLikes] = useState(post.likeCount || 0)

  const handleLike = () => {
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)
    onLike()
  }

  return (
    <div className="bg-earth-900 border border-earth-700 rounded-[2.5rem] shadow-xl overflow-hidden group">
       {/* Post Header */}
       <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-earth-800 border border-earth-700 overflow-hidden">
                {post.author.image && <img src={post.author.image} className="w-full h-full object-cover" />}
             </div>
             <div>
                <h4 className="font-black text-earth-50 uppercase text-xs leading-none mb-1">{post.author.name}</h4>
                <p className="text-[9px] font-bold text-earth-400 uppercase tracking-widest">@{post.author.username || 'explorer'} • {post.region}</p>
             </div>
          </div>
          <button className="text-earth-700 hover:text-earth-50">
             <MoreHorizontal className="w-5 h-5" />
          </button>
       </div>

       {/* Post Body */}
       <div className="px-6 pb-4">
          <p className="text-earth-200 text-sm font-medium leading-relaxed mb-4">{post.content}</p>
          
          {post.photos?.[0] && (
            <div className="rounded-[1.5rem] overflow-hidden border border-earth-800 mb-4">
               <img src={post.photos[0]} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          )}

          {post.type === 'find' && (
            <div className="bg-earth-950 border border-earth-800 rounded-2xl p-4 flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-mineral-teal/10 rounded-xl flex items-center justify-center text-mineral-teal">
                     <Zap className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-earth-50 uppercase">{post.mineralName || 'Mineral Specimen'}</p>
                     <p className="text-[8px] font-bold text-earth-700 uppercase">New Discovery</p>
                  </div>
               </div>
               <Link to="/explore" className="text-[9px] font-black text-mineral-teal uppercase hover:underline">View Location</Link>
            </div>
          )}
       </div>

       {/* Post Actions */}
       <div className="px-6 py-4 border-t border-earth-800 flex items-center justify-between">
          <div className="flex items-center gap-6">
             <button 
               onClick={handleLike}
               className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${liked ? 'text-mineral-copper' : 'text-earth-700 hover:text-earth-400'}`}
             >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} /> {likes}
             </button>
             <button className="flex items-center gap-2 text-earth-700 hover:text-earth-400 text-[10px] font-black uppercase tracking-widest">
                <MessageSquare className="w-4 h-4" /> {post.commentCount || 0}
             </button>
             <button className="flex items-center gap-2 text-earth-700 hover:text-earth-400 text-[10px] font-black uppercase tracking-widest">
                <Share2 className="w-4 h-4" /> {post.shareCount || 0}
             </button>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[8px] font-black text-earth-800 uppercase bg-earth-950 px-2 py-0.5 rounded italic">{post.type.replace('_', ' ')}</span>
          </div>
       </div>
    </div>
  )
}
