import { useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { X, Loader2, Plus } from 'lucide-react';
import type { Id } from '../../convex/_generated/dataModel';

interface PhotoUploadProps {
  onUploadComplete: (storageIds: Id<"_storage">[]) => void;
  label?: string;
  multiple?: boolean;
}

export function PhotoUpload({ onUploadComplete, label = "Add Photo", multiple = false }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previews, setPreviews] = useState<{id: string, url: string}[]>([]);
  const [storageIds, setStorageIds] = useState<Id<"_storage">[]>([]);
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    
    const newStorageIds: Id<"_storage">[] = [...storageIds];
    const newPreviews = [...previews];

    for (const file of files) {
      try {
        // 1. Get a short-lived upload URL
        const postUrl = await generateUploadUrl();

        // 2. POST the file to the URL
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        
        const { storageId } = await result.json();
        
        newStorageIds.push(storageId);
        
        // Add to previews
        const url = URL.createObjectURL(file);
        newPreviews.push({ id: storageId, url });

      } catch (error) {
        console.error("Upload failed for file:", file.name, error);
      }
    }

    setStorageIds(newStorageIds);
    setPreviews(newPreviews);
    onUploadComplete(newStorageIds);
    setIsUploading(false);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (id: string) => {
    const updatedIds = storageIds.filter(sid => sid !== id);
    const updatedPreviews = previews.filter(p => p.id !== id);
    setStorageIds(updatedIds);
    setPreviews(updatedPreviews);
    onUploadComplete(updatedIds);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {previews.map((preview) => (
          <div key={preview.id} className="relative aspect-square rounded-2xl overflow-hidden border border-stone-200 shadow-sm group">
            <img src={preview.url} alt="Preview" className="w-full h-full object-cover" />
            <button 
              type="button"
              onClick={() => removePhoto(preview.id)}
              className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {(multiple || previews.length === 0) && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-emerald-500 hover:text-emerald-600 transition-all bg-stone-50 disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
            <span className="text-[9px] font-black uppercase tracking-widest">{previews.length > 0 ? "Add More" : label}</span>
          </button>
        )}
      </div>

      <input 
        type="file" 
        multiple={multiple}
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
    </div>
  );
}
