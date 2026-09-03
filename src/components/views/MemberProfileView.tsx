import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Mail, Phone, Linkedin, Github, Globe, BookOpen, 
  Award, ShieldCheck, CheckCircle, Cpu, Calendar, MapPin, 
  Sparkles, ExternalLink, Share2, Copy, Check, Star, Users,
  GraduationCap
} from 'lucide-react';
import { TeamMember } from '../../types';
import { safeFetchJson } from '../../utils/api';

interface MemberProfileViewProps {
  idOrSlug: string;
  onNavigate?: (path: string) => void;
}

const MEMBER_TYPE_META: Record<string, { label: string; bg: string; text: string; border: string }> = {
  FACULTY: { label: 'Club_Head', bg: 'bg-red-950/60', text: 'text-red-400', border: 'border-red-800/60' },
  TECHNICAL_LEAD: { label: 'Technical Domain Lead', bg: 'bg-sky-950/60', text: 'text-sky-400', border: 'border-sky-800/60' },
  COORDINATOR: { label: 'Student Coordinator', bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-800/60' },
  PROJECT_LEAD: { label: 'Project Lead', bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/60' },
  MEMBER: { label: 'Core Team Member', bg: 'bg-purple-950/60', text: 'text-purple-400', border: 'border-purple-800/60' },
  LAB_ASSISTANT: { label: 'Lab Assistant', bg: 'bg-cyan-950/60', text: 'text-cyan-400', border: 'border-cyan-800/60' },
  ALUMNI: { label: 'Alumni / Advisor', bg: 'bg-blue-950/60', text: 'text-blue-400', border: 'border-blue-800/60' },
  ADVISOR: { label: 'Advisor', bg: 'bg-indigo-950/60', text: 'text-indigo-400', border: 'border-indigo-800/60' },
  OTHER: { label: 'Special Member', bg: 'bg-slate-800/60', text: 'text-slate-300', border: 'border-slate-700' },
};

export const MemberProfileView: React.FC<MemberProfileViewProps> = ({ idOrSlug, onNavigate }) => {
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await safeFetchJson(`/api/team-members/${encodeURIComponent(idOrSlug)}`);
        if (data && isMounted) {
          setMember(data);
        } else {
          if (isMounted) setError('Profile not found');
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load profile');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (idOrSlug) {
      fetchProfile();
    }
    return () => { isMounted = false; };
  }, [idOrSlug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('/team');
    } else {
      window.location.href = '/team';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-slate-400 space-y-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Loading member profile...</p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-[60vh] max-w-2xl mx-auto flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-400">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Profile Not Found</h2>
        <p className="text-sm text-slate-400">The team member profile you are looking for might have been moved or is currently unpublished.</p>
        <button
          onClick={handleBack}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
        >
          ← Back to Team Directory
        </button>
      </div>
    );
  }

  const badge = MEMBER_TYPE_META[member.memberType?.toUpperCase()] || MEMBER_TYPE_META.OTHER;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Members</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 px-3 py-2 rounded-xl transition-colors"
            title="Copy Public Profile Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Share Profile'}</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8 relative z-10">
          {/* Avatar Photo */}
          <div className="relative shrink-0 mx-auto md:mx-0">
            <img
              src={member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400'}
              alt={member.name}
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl object-cover ring-4 ring-slate-800 shadow-2xl"
            />
            {member.isActive && (
              <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                Active
              </span>
            )}
          </div>

          {/* Core Info */}
          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                {badge.label}
              </span>
              {member.isFeatured && (
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-950/60 text-amber-400 border border-amber-800/60 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  Featured Member
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{member.name}</h1>
              <p className="text-sm sm:text-base font-semibold text-red-400 mt-0.5">{member.designation}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-500" />
                <span>{member.department}</span>
              </div>
              {member.batch && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{member.batch}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{member.college || 'LNJPIT Chapra'}</span>
              </div>
            </div>

            {/* Social Links Bar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-3">
              {member.socialLinks?.linkedin && (
                <a
                  href={member.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 hover:text-sky-400 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
                >
                  <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                  <span>LinkedIn Profile</span>
                </a>
              )}
              {member.socialLinks?.github && (
                <a
                  href={member.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-600 hover:text-white text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              )}
              {member.socialLinks?.portfolio && (
                <a
                  href={member.socialLinks.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 hover:text-emerald-400 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Portfolio</span>
                </a>
              )}
              {member.socialLinks?.googleScholar && (
                <a
                  href={member.socialLinks.googleScholar}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 hover:text-amber-400 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Google Scholar</span>
                </a>
              )}
              {member.socialLinks?.researchGate && (
                <a
                  href={member.socialLinks.researchGate}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500 hover:text-teal-400 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
                >
                  <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                  <span>ResearchGate</span>
                </a>
              )}
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600/10 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Contact</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Biography, Projects, Responsibilities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biography */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>About & Leadership</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {member.fullBiography || member.shortBio || 'Active contributor to robotics and embedded engineering projects at e-Yantra LNJPIT.'}
            </p>
          </div>

          {/* Projects Led & Key Contributions */}
          {member.projects && member.projects.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Featured Robotics & Hardware Projects</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {member.projects.map((proj, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-400 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{proj}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">e-Yantra LNJPIT Innovation Lab</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Responsibilities */}
          {member.responsibilities && member.responsibilities.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>e-Yantra Lab Roles & Responsibilities</span>
              </h3>
              <ul className="space-y-2">
                {member.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Achievements & Recognitions */}
          {member.achievements && member.achievements.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Honors & Competitions</span>
              </h3>
              <div className="space-y-2">
                {member.achievements.map((ach, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-3 text-xs text-slate-200">
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-semibold">{ach}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Technical Stack & Contact Details */}
        <div className="space-y-6">
          {/* Technical Skills & Expertise */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Technical Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {(member.skills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-medium text-xs hover:border-red-500/50 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Areas of Interest */}
          {member.areasOfInterest && member.areasOfInterest.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white">Research & Focus Areas</h3>
              <div className="flex flex-wrap gap-1.5">
                {member.areasOfInterest.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-900/60 text-red-300 text-xs font-semibold"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Official Verification & Contact Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Verified Contact Info</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block">Official Email</span>
                <a
                  href={`mailto:${member.email}`}
                  className="font-semibold text-slate-200 hover:text-red-400 transition-colors break-all"
                >
                  {member.email}
                </a>
              </div>

              {member.phone && (
                <div>
                  <span className="text-[11px] text-slate-500 block">Phone</span>
                  <a
                    href={`tel:${member.phone}`}
                    className="font-semibold text-slate-200 hover:text-red-400 transition-colors"
                  >
                    {member.phone}
                  </a>
                </div>
              )}

              <div>
                <span className="text-[11px] text-slate-500 block">Lab Affiliation</span>
                <p className="font-semibold text-slate-300">e-Yantra Robotics Innovation Lab, LNJPIT Chapra</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfileView;
