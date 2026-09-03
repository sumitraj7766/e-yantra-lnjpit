import React, { useState } from 'react';
import { BookOpen, ExternalLink, Download, Search, FileText } from 'lucide-react';
import { LearningResource } from '../../types';

interface ResourcesViewProps {
  resources?: LearningResource[];
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({ resources = [] }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Robotics', 'ESP32', 'AI/ML', 'Embedded Systems', 'Python'];

  const filtered = (resources || []).filter(r => {
    const matchesCat = activeCategory === 'All' || r.category === activeCategory;
    const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-100">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">e-Yantra Learning Center</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Technical Learning Resources</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Curated PDFs, micro-controller guides, ROS 2 documentation, and GitHub repository boilerplates for LNJPIT students.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guides or topics..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                activeCategory === c ? 'bg-red-600 text-white' : 'bg-slate-950 text-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(res => (
          <div key={res.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-red-400">{res.category}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  {res.type}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{res.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{res.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">By {res.author}</span>
              <a
                href={res.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <span>Access Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
