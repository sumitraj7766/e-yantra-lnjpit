import React, { useState } from 'react';
import { Image, X } from 'lucide-react';
import { GalleryItem } from '../../types';

interface GalleryViewProps {
  gallery?: GalleryItem[];
}

export const GalleryView: React.FC<GalleryViewProps> = ({ gallery = [] }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLightbox, setActiveLightbox] = useState<GalleryItem | null>(null);

  const categories = ['All', 'Events', 'Workshops', 'Projects', 'Competitions', 'Campus'];

  const filtered = activeCategory === 'All'
    ? (gallery || [])
    : (gallery || []).filter(g => g.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-100">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">e-Yantra LNJPIT Gallery</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Lab, Events & Competition Showcase</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Glimpses of robotics testing, hands-on bootcamps, and LNJPIT campus activities.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
              activeCategory === cat ? 'bg-red-600 text-white shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(item => (
          <div
            key={item.id}
            onClick={() => setActiveLightbox(item)}
            className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer shadow-md h-60"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-3 left-3 right-3 space-y-1">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/50">
                {item.category}
              </span>
              <p className="text-xs font-bold text-white line-clamp-1">{item.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {activeLightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-4 space-y-3 relative text-slate-100">
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={activeLightbox.imageUrl} alt={activeLightbox.title} className="w-full h-[400px] object-cover rounded-xl" />
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-white">{activeLightbox.title}</h3>
              <p className="text-xs text-slate-300">{activeLightbox.caption}</p>
              <p className="text-[10px] text-slate-500">{activeLightbox.date}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
