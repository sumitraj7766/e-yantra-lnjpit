import React from 'react';
import { ArrowLeft, Calendar, User, Eye, Tag } from 'lucide-react';
import { BlogPost } from '../../types';

interface BlogViewProps {
  blogPosts?: BlogPost[];
  posts?: BlogPost[];
  navigate: (path: string) => void;
  selectedSlug?: string;
}

export const BlogView: React.FC<BlogViewProps> = ({ blogPosts, posts, navigate, selectedSlug }) => {
  const allPosts = blogPosts || posts || [];

  const currentPost = selectedSlug
    ? allPosts.find(b => b.slug === selectedSlug || b.id === selectedSlug)
    : null;

  if (currentPost) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-100">
        <button
          onClick={() => navigate('/blog')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog & News
        </button>

        <article className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 sm:p-10 space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase px-3 py-1 rounded bg-red-950 text-red-400 border border-red-800/50">
              {currentPost.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">{currentPost.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-b border-slate-800 pb-4">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-red-500" /> {currentPost.author}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-500" /> {currentPost.publishDate}</span>
              <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-slate-500" /> {currentPost.views || 0} Views</span>
            </div>
          </div>

          <img src={currentPost.coverImage} alt={currentPost.title} className="w-full h-72 sm:h-96 object-cover rounded-xl" />

          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {currentPost.content}
          </div>

          {currentPost.tags && (
            <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-xs">
              <Tag className="w-3.5 h-3.5 text-red-400" />
              {currentPost.tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-100">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">e-Yantra LNJPIT Blog</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Articles, Tutorials & Technical News</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Technical guides on ROS 2, ESP32 microcontrollers, YOLOv8 computer vision, and community announcements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allPosts.map(post => (
          <div
            key={post.id}
            onClick={() => navigate(`/blog/${post.slug}`)}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:border-red-800 transition-all flex flex-col justify-between"
          >
            <div>
              <img src={post.coverImage} alt={post.title} className="w-full h-48 object-cover" />
              <div className="p-5 space-y-3">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/50">
                  {post.category}
                </span>
                <h3 className="text-lg font-bold text-white hover:text-red-400 transition-colors">{post.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{post.content.replace(/[#*`]/g, '')}</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
              <span>{post.author}</span>
              <span className="text-red-400 font-semibold">Read Article ›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
