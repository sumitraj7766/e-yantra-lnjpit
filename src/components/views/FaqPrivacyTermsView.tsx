import React from 'react';
import { FAQItem } from '../../types';

interface FaqPrivacyTermsViewProps {
  type?: 'faq' | 'privacy' | 'terms';
  currentPath?: string;
  faqs?: FAQItem[];
}

export const FaqPrivacyTermsView: React.FC<FaqPrivacyTermsViewProps> = ({ type, currentPath, faqs = [] }) => {
  const activeType = type || (currentPath === '/privacy' ? 'privacy' : currentPath === '/terms' ? 'terms' : 'faq');

  if (activeType === 'privacy') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-slate-100 text-xs sm:text-sm">
        <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-slate-400">Effective Date: August 2026</p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 leading-relaxed text-slate-300">
          <p>e-Yantra LNJPIT respects your privacy. This policy outlines how student applications, event registrations, and user account information are processed on our official platform.</p>
          <h3 className="font-bold text-white text-base">1. Information We Collect</h3>
          <p>We collect student name, institutional email, department, contact number, and skills submitted voluntarily via join forms and event registrations.</p>
          <h3 className="font-bold text-white text-base">2. Use of Information</h3>
          <p>Information is used strictly for organizing robotics workshops, shortlisting competition teams, and academic record-keeping under LNJPIT Chapra supervision.</p>
        </div>
      </div>
    );
  }

  if (activeType === 'terms') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-slate-100 text-xs sm:text-sm">
        <h1 className="text-3xl font-extrabold text-white">Terms & Conditions</h1>
        <p className="text-slate-400">Effective Date: August 2026</p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 leading-relaxed text-slate-300">
          <p>By accessing the e-Yantra LNJPIT platform, you agree to abide by LNJPIT code of conduct, lab safety protocols, and intellectual property guidelines for student projects.</p>
          <h3 className="font-bold text-white text-base">1. Lab Equipment Usage</h3>
          <p>All microcontrollers, sensor kits, and 3D printers inside the e-Yantra Lab must be logged and handled responsibly under coordinator supervision.</p>
        </div>
      </div>
    );
  }

  // FAQ VIEW
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-100">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Help Center</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Frequently Asked Questions</h1>
      </div>

      <div className="space-y-4">
        {(faqs || []).map(f => (
          <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
            <h3 className="font-bold text-white text-base">{f.question}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{f.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
