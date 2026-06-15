import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../../convex/_generated/api'
import { useMutation, Authenticated, Unauthenticated } from 'convex/react'
import { useState, useRef, useEffect } from 'react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_community-layout/chat/$roomSlug')({
  component: ChatRoom,
})

function ChatRoom() {
  const { roomSlug } = Route.useParams() as { roomSlug: string }
  const { data: room } = useSuspenseQuery(convexQuery(api.chat.getRoom, { slug: roomSlug }))
  const navigate = useNavigate()

  if (!room) {
    return <div className="p-8 text-center font-bold">Room not found.</div>
  }

  return (
    <>
      <Authenticated>
        <ChatInterface room={room} />
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-stone-900 mb-2 uppercase italic">Member Access Only</h2>
          <p className="text-stone-500 mb-8 max-w-xs font-medium">Join the community to participate in chat rooms and share finds.</p>
          <button 
            onClick={() => navigate({ to: '/auth' })} 
            className="bg-emerald-600 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-sm shadow-xl"
          >
            Sign In to Chat
          </button>
        </div>
      </Unauthenticated>
    </>
  )
}

function ChatInterface({ room }: { room: any }) {
  const { data: messages } = useSuspenseQuery(convexQuery(api.chat.listMessages, { roomId: room._id }))
  const sendMessage = useMutation(api.chat.sendMessage)
  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const currentText = text
    setText('')
    await sendMessage({ roomId: room._id, text: currentText })
  }

  return (
    <div className="flex flex-col h-screen bg-stone-50 overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-4">
        <Link to="/chat" className="text-stone-400 hover:text-stone-900 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-black text-stone-900 uppercase italic tracking-tighter text-lg">{room.name}</h1>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Discussion</p>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.map((msg) => (
          <div key={msg._id} className="flex gap-4 group">
            <div className="flex-none w-10 h-10 rounded-xl bg-stone-200 overflow-hidden">
              {msg.user.image ? (
                <img src={msg.user.image} alt={msg.user.name ?? 'User'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400 font-bold bg-stone-200">
                  {msg.user.name?.[0] ?? '?'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-black text-stone-900 text-sm">{msg.user.name ?? 'Anonymous Rockhound'}</span>
                <span className="text-[10px] text-stone-400 font-bold uppercase">
                  {new Date(msg._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSend}
        className="flex-none bg-white border-t border-stone-200 p-4 md:pb-8"
      >
        <div className="flex items-center gap-3 bg-stone-100 rounded-2xl px-4 py-2 border border-stone-200 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-inner">
          <input 
            type="text" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message #${room.slug}...`}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-stone-900 placeholder-stone-400 font-medium"
          />
          <button 
            type="submit"
            disabled={!text.trim()}
            className="text-emerald-600 disabled:text-stone-300 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
