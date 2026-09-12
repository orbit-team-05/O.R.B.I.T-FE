import { X } from "lucide-react";

export function ImagePreviewModal({ open, src, onClose }) {
    if (!open || !src) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}>
            <button
                onClick={onClose}
                className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            >
                <X size={24} />
            </button>
            <div className="relative max-h-[90vh] max-w-[90vw] p-4" onClick={e => e.stopPropagation()}>
                <img 
                    src={src} 
                    alt="Preview" 
                    className="max-h-full max-w-full rounded-lg object-contain shadow-2xl ring-1 ring-white/10" 
                />
            </div>
        </div>
    );
}
