import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { 
  Compass, 
  MessageSquare, 
  User, 
  ShoppingBag,
  Users
} from 'lucide-react'

// Root layout with bottom navigation
export const Route = createFileRoute('/_community-layout')({
  component: CommunityLayout,
})

function CommunityLayout() {
  return (
    <div className="min-h-screen bg-earth-950">
      <main>
        <Outlet />
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-earth-900/90 backdrop-blur-xl border-t border-earth-700 px-6 py-3 flex justify-between items-center z-[1000]">
        <NavButton icon={<MessageSquare />} label="Feed" to="/" />
        <NavButton icon={<Compass />} label="Explore" to="/explore" />
        <NavButton icon={<Users />} label="Hub" to="/community" />
        <NavButton icon={<ShoppingBag />} label="Market" to="/classifieds" />
        <NavButton icon={<User />} label="You" to="/profile" />
      </nav>
    </div>
  )
}

function NavButton({ icon, label, to }: { icon: React.ReactNode, label: string, to: string }) {
  return (
    <Link 
      to={to} 
      className="flex flex-col items-center gap-1 text-earth-400 hover:text-mineral-copper transition-colors [&.active]:text-mineral-teal"
    >
      <div className="w-6 h-6 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </Link>
  )
}
