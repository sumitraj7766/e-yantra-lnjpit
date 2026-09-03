import React, { useState, useEffect } from 'react';
import { Search, X, FolderGit2, Calendar, UserCheck, BookOpen, FileText } from 'lucide-react';
import { Project, EventItem, FacultyMember, BlogPost, LearningResource } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, navigate }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    projects: Project[];
    events: EventItem[];
    faculty: FacultyMember[];
    blog: BlogPost[];
    resources: LearningResource[];
  }>({
    projects: [],
    events: [],
    faculty: [],
    blog: [],
    resources: []
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults({ projects: [], events: [], faculty: [], blog: [], resources: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalHits = 
    (results?.projects?.length || 0) + 
    (results?.events?.length || 0) + 
    (results?.faculty?.length || 0) + 
    (results?.blog?.length || 0) + 
    (results?.resources?.length || 0);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-red-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search projects, events, faculty, ROS 2, blogs, resources..."
            className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder-slate-500"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="px-2 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 rounded">
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loading && (
            <p className="text-center text-xs text-slate-400 py-8">Searching e-Yantra LNJPIT database...</p>
          )}

          {!loading && query && totalHits === 0 && (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm font-semibold text-slate-300">No results found for "{query}"</p>
              <p className="text-xs text-slate-500">Try searching for "rover", "ESP32", "ROS2", "workshop", or "faculty".</p>
            </div>
          )}

          {/* Projects Hits */}
          {(results?.projects || []).length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" />
                Projects ({(results?.projects || []).length})
              </h4>
              <div className="space-y-1.5">
                {(results?.projects || []).map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(`/projects/${p.slug}`)}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{p.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{p.shortDescription}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {p.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Events Hits */}
          {(results?.events || []).length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Events ({(results?.events || []).length})
              </h4>
              <div className="space-y-1.5">
                {(results?.events || []).map(e => (
                  <button
                    key={e.id}
                    onClick={() => handleSelect(`/events/${e.slug}`)}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{e.title}</p>
                      <p className="text-[11px] text-slate-400">{e.date} • {e.venue}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/50">
                      {e.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Faculty Hits */}
          {(results?.faculty || []).length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                Faculty Mentors ({(results?.faculty || []).length})
              </h4>
              <div className="space-y-1.5">
                {(results?.faculty || []).map(f => (
                  <button
                    key={f.id}
                    onClick={() => handleSelect(`/team/faculty`)}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 transition-colors flex items-center gap-3"
                  >
                    <img src={f.photo} alt={f.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-semibold text-white">{f.name}</p>
                      <p className="text-[11px] text-slate-400">{f.designation} • {f.department}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Blog & Resources Hits */}
          {(results?.blog || []).length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Articles ({(results?.blog || []).length})
              </h4>
              <div className="space-y-1.5">
                {(results?.blog || []).map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleSelect(`/blog/${b.slug}`)}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 transition-colors"
                  >
                    <p className="text-xs font-semibold text-white">{b.title}</p>
                    <p className="text-[11px] text-slate-400">{b.category} • Published {b.publishDate}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
