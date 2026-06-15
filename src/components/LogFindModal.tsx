import { useState, useRef } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Camera, X, Sparkles, Loader2 } from 'lucide-react'

interface LogFindModalProps {
  locationId: Id<'locations'>
  locationName: string
  onClose: () => void
  onSuccess: () => void
}

export default function LogFindModal({ locationId, locationName, onClose, onSuccess }: LogFindModalProps) {
  const [mineralName, setMineralName] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<{ id: Id<'_storage'>, url: string }[]>([])
  const [isUploading, setIsLeafletUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl)
  const submitFind = useMutation(api.locationActivity.submitFindReport)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsLeafletUploading(true)
    try {
      for (const file of Array.from(files)) {
        const postUrl = await generateUploadUrl()
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })
        const { storageId } = await result.json()
        const url = URL.createObjectURL(file)
        setPhotos(prev => [...prev, { id: storageId, url }])
      }
    } catch (err) {
      console.error("Upload failed", err)
    } finally {
      setIsLeafletUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mineralName || !description) return

    setIsSubmitting(true)
    try {
      await submitFind({
        locationId,
        mineralName,
        description,
        photos: photos.map(p => p.id),
        dateFound: Date.now(),
        isPrivate: false,
      })
      onSuccess()
      onClose()
    } catch (err) {
      console.error("Submit failed", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <div>
            <h2 className="text-2xl font-black text-stone-900 uppercase italic tracking-tight">Log a Discovery</h2>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{locationName}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white rounded-full border border-stone-200 text-stone-400 hover:text-stone-900 transition-colors shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">What did you find?</label>
            <input 
              required
              value={mineralName}
              onChange={e => setMineralName(e.target.value)}
              placeholder="e.g. Carnelian Agate, Blue Chalcedony..."
              className="w-full bg-stone-100 border-none rounded-2xl px-6 py-4 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner placeholder-stone-400"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">The Story</label>
            <textarea 
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Where exactly? How was the hunt? Any tips for others?"
              rows={4}
              className="w-full bg-stone-100 border-none rounded-2xl px-6 py-4 text-sm font-medium text-stone-600 focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner placeholder-stone-400 resize-none"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Proof of Find</label>
            <div className="flex flex-wrap gap-3">
              {photos.map((p, i) => (
                <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500/20 group">
                  <img src={p.url} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-black/40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-1 text-stone-400 hover:border-emerald-500 hover:text-emerald-500 transition-all bg-stone-50 group"
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase">Add Photo</span>
                  </>
                )}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
                multiple
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !mineralName || !description}
            className="w-full bg-stone-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 transition-all flex items-center justify-center gap-3 group"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Publish Find Report
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
