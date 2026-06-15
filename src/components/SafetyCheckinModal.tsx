import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { ShieldCheck, X, Clock, Users, MessageSquare, Loader2, Compass } from 'lucide-react'

interface SafetyCheckinModalProps {
  locationId: Id<'locations'>
  locationName: string
  onClose: () => void
  onSuccess: () => void
}

export default function SafetyCheckinModal({ locationId, locationName, onClose, onSuccess }: SafetyCheckinModalProps) {
  const [returnHours, setReturnHours] = useState('4')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const checkIn = useMutation(api.safety.checkIn)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emergencyContact) return

    setIsSubmitting(true)
    try {
      const returnTime = Date.now() + (parseInt(returnHours) * 60 * 60 * 1000)
      await checkIn({
        locationId,
        expectedReturnTime: returnTime,
        emergencyContact,
        notes: notes || undefined
      })
      onSuccess()
      onClose()
    } catch (err) {
      console.error("Check-in failed", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-6 bg-emerald-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-emerald-900 text-white">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
               <ShieldCheck className="w-6 h-6 text-emerald-400" />
             </div>
             <div>
               <h2 className="text-2xl font-black uppercase italic tracking-tight leading-tight">Safety Check-in</h2>
               <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{locationName}</p>
             </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex gap-4">
             <Compass className="w-6 h-6 text-emerald-600 flex-none" />
             <p className="text-emerald-800 text-xs font-medium leading-relaxed">
               Going off-grid? We'll track your expected return. If you don't check out by your deadline, your emergency contact and local regional community will be notified.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Plan Duration</label>
              <div className="relative">
                <select 
                  value={returnHours}
                  onChange={e => setReturnHours(e.target.value)}
                  className="w-full bg-stone-100 border-none rounded-2xl px-6 py-4 text-sm font-bold text-stone-900 appearance-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
                >
                  <option value="2">2 Hours (Quick hunt)</option>
                  <option value="4">4 Hours (Half day)</option>
                  <option value="8">8 Hours (Full day)</option>
                  <option value="12">12 Hours (Sunset return)</option>
                  <option value="24">24 Hours (Overnight)</option>
                </select>
                <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Emergency Contact</label>
              <div className="relative">
                <input 
                  required
                  value={emergencyContact}
                  onChange={e => setEmergencyContact(e.target.value)}
                  placeholder="Phone or Email"
                  className="w-full bg-stone-100 border-none rounded-2xl px-6 py-4 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
                />
                <Users className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Route / Plan Notes</label>
            <div className="relative">
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Parking at mile marker 4, heading up the north creek bed."
                rows={3}
                className="w-full bg-stone-100 border-none rounded-2xl px-6 py-4 text-sm font-medium text-stone-600 focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner resize-none"
              />
              <MessageSquare className="absolute right-4 top-4 w-5 h-5 text-stone-400 pointer-events-none" />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !emergencyContact}
            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-emerald-700 disabled:bg-stone-200 disabled:text-stone-400 transition-all flex items-center justify-center gap-3 group"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Activate Safety Protocol
                <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
