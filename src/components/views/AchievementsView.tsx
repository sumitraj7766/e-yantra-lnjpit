import React from 'react';
import { Trophy, Award, Medal, Star } from 'lucide-react';
import { Achievement } from '../../types';

interface AchievementsViewProps {
  achievements?: Achievement[];
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ achievements = [] }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-slate-100">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Honors & Accolades</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">e-Yantra LNJPIT Achievements</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Celebrating national competition wins, state hackathon awards, and milestone technical deployments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {(achievements || []).map(ach => (
          <div key={ach.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              {ach.image && (
                <img src={ach.image} alt={ach.title} className="w-full h-48 object-cover rounded-xl" />
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Trophy className="w-4 h-4" /> {ach.awardLevel || 'National Level'}
                </span>
                <span className="text-slate-400">{ach.date}</span>
              </div>
              <h3 className="text-xl font-bold text-white">{ach.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{ach.description}</p>
            </div>

            {ach.team && (
              <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Team: </span> {ach.team}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
