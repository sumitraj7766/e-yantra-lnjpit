import React, { useState, useEffect } from 'react';
import { 
  Mail, Linkedin, Github, Globe, BookOpen, GraduationCap, 
  Award, Layers, X, ExternalLink, Sparkles, Star, Users, Cpu,
  Search, ShieldCheck, ArrowRight
} from 'lucide-react';
import { FacultyMember, StudentCoordinator, TechnicalLead, Testimonial, TeamMember } from '../../types';
import { safeFetchJson } from '../../utils/api';

interface TeamViewProps {
  currentPath?: string;
  navigate: (path: string) => void;
  faculty?: FacultyMember[];
  coordinators?: StudentCoordinator[];
  technicalLeads?: TechnicalLead[];
  testimonials?: Testimonial[];
  subRoute?: 'faculty' | 'coordinators' | 'technical-leads' | 'alumni';
}

const MEMBER_TYPE_LABELS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  FACULTY: { label: 'Club_Head', bg: 'bg-red-950/60', text: 'text-red-400', border: 'border-red-800/60' },
  TECHNICAL_LEAD: { label: 'Technical Domain Lead', bg: 'bg-sky-950/60', text: 'text-sky-400', border: 'border-sky-800/60' },
  COORDINATOR: { label: 'Student Coordinator', bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-800/60' },
  PROJECT_LEAD: { label: 'Project Lead', bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/60' },
  MEMBER: { label: 'Core Team Member', bg: 'bg-purple-950/60', text: 'text-purple-400', border: 'border-purple-800/60' },
  LAB_ASSISTANT: { label: 'Lab Assistant', bg: 'bg-cyan-950/60', text: 'text-cyan-400', border: 'border-cyan-800/60' },
  ALUMNI: { label: 'Alumni / Advisor', bg: 'bg-blue-950/60', text: 'text-blue-400', border: 'border-blue-800/60' },
  ADVISOR: { label: 'Advisor', bg: 'bg-indigo-950/60', text: 'text-indigo-400', border: 'border-indigo-800/60' },
  OTHER: { label: 'e-Yantra Member', bg: 'bg-slate-800/60', text: 'text-slate-300', border: 'border-slate-700' },
};

export const TeamView: React.FC<TeamViewProps> = ({
  currentPath = '/team',
  navigate,
  faculty = [],
  coordinators = [],
  technicalLeads = [],
  testimonials = [],
  subRoute
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Fetch unified team members from MongoDB API
  useEffect(() => {
    let isMounted = true;
    const fetchTeam = async () => {
      setLoading(true);
      try {
        const data = await safeFetchJson('/api/team-members');
        if (isMounted) {
          if (Array.isArray(data)) {
            setTeamMembers(data);
          }
          setHasFetched(true);
        }
      } catch (err) {
        if (isMounted) setHasFetched(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTeam();
    return () => { isMounted = false; };
  }, []);

  // Determine active category filter
  let categoryFilter = subRoute || 'all';
  if (currentPath === '/team/faculty') categoryFilter = 'faculty';
  if (currentPath === '/team/coordinators') categoryFilter = 'coordinators';
  if (currentPath === '/team/technical-leads') categoryFilter = 'leads';
  if (currentPath === '/team/alumni') categoryFilter = 'alumni';

  // Ensure fallback from props only before initial API fetch completes
  const activeMemberList: TeamMember[] = hasFetched ? teamMembers : [
    ...faculty.map(f => ({
      id: f.id,
      name: f.name,
      slug: f.slug || f.id,
      memberType: 'FACULTY' as const,
      designation: f.designation,
      department: f.department,
      batch: 'Faculty Mentorship',
      college: 'LNJPIT Chapra',
      shortBio: f.bio || '',
      fullBiography: f.bio || '',
      skills: f.areasOfInterest || [],
      areasOfInterest: f.areasOfInterest || [],
      projects: [],
      achievements: [],
      responsibilities: [],
      email: f.email || '',
      phone: f.phone || '',
      socialLinks: {
        linkedin: f.linkedin,
        github: f.github,
        portfolio: f.portfolio
      },
      photo: f.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
      isActive: true,
      isFeatured: true,
      isPublished: true,
      visibility: 'PUBLIC' as const
    })),
    ...technicalLeads.map(l => ({
      id: l.id,
      name: l.name,
      slug: l.slug || l.id,
      memberType: 'TECHNICAL_LEAD' as const,
      designation: l.role,
      department: l.domain || 'Robotics',
      batch: l.batch || 'Current Lead',
      college: 'LNJPIT Chapra',
      shortBio: l.bio || '',
      fullBiography: l.bio || '',
      skills: l.skills || [],
      areasOfInterest: l.skills || [],
      projects: [],
      achievements: [],
      responsibilities: [],
      email: l.email || '',
      phone: l.phone || '',
      socialLinks: {
        linkedin: l.linkedin,
        github: l.github,
        portfolio: l.portfolio
      },
      photo: l.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
      isActive: true,
      isFeatured: true,
      isPublished: true,
      visibility: 'PUBLIC' as const
    })),
    ...coordinators.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug || c.id,
      memberType: 'COORDINATOR' as const,
      designation: c.role,
      department: c.branch || 'Engineering',
      batch: c.batch || 'Coordinator',
      college: 'LNJPIT Chapra',
      shortBio: c.bio || '',
      fullBiography: c.bio || '',
      skills: [],
      areasOfInterest: [],
      projects: [],
      achievements: [],
      responsibilities: [],
      email: c.email || '',
      phone: c.phone || '',
      socialLinks: {
        linkedin: c.linkedin,
        github: c.github,
        portfolio: c.portfolio
      },
      photo: c.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
      isActive: true,
      isFeatured: true,
      isPublished: true,
      visibility: 'PUBLIC' as const
    }))
  ];

  // Filter members based on category and search query
  const filteredMembers = activeMemberList.filter(m => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        m.name.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        (m.skills || []).some(s => s.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (categoryFilter === 'faculty') return m.memberType === 'FACULTY';
    if (categoryFilter === 'coordinators') return m.memberType === 'COORDINATOR';
    if (categoryFilter === 'leads') return m.memberType === 'TECHNICAL_LEAD' || m.memberType === 'PROJECT_LEAD';
    return true;
  });

  const facultyMembers = filteredMembers.filter(m => m.memberType === 'FACULTY');
  const technicalLeadsList = filteredMembers.filter(m => m.memberType === 'TECHNICAL_LEAD');
  const studentCoordinators = filteredMembers.filter(m => m.memberType === 'COORDINATOR');
  const projectLeadsAndMembers = filteredMembers.filter(m => m.memberType === 'PROJECT_LEAD' || m.memberType === 'MEMBER' || m.memberType === 'OTHER');

  const renderMemberCard = (m: TeamMember) => {
    const badge = MEMBER_TYPE_LABELS[m.memberType?.toUpperCase()] || MEMBER_TYPE_LABELS.OTHER;

    return (
      <div 
        key={m.id} 
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg hover:border-red-900/60 transition-all flex flex-col justify-between group hover:shadow-2xl"
      >
        <div>
          {/* Header Photo & Badge */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="relative">
              <img 
                src={m.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400'} 
                alt={m.name} 
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-slate-800 group-hover:ring-red-500/50 transition-all shadow-md" 
              />
              {m.isActive && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" title="Active Member" />
              )}
            </div>

            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
              {badge.label}
            </span>
          </div>

          {/* Name & Role */}
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">{m.name}</h3>
              {m.isFeatured && (
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" title="Featured Member" />
              )}
            </div>
            <p className="text-xs font-semibold text-slate-300 mt-0.5">{m.designation}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{m.department} {m.batch ? `• ${m.batch}` : ''}</p>
          </div>

          {/* Short Bio */}
          {m.shortBio && (
            <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed">
              {m.shortBio}
            </p>
          )}

          {/* Skills Tags */}
          {m.skills && m.skills.length > 0 && (
            <div className="pt-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Technical Stack:</p>
              <div className="flex flex-wrap gap-1">
                {m.skills.slice(0, 4).map(skill => (
                  <span key={skill} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800">
                    {skill}
                  </span>
                ))}
                {m.skills.length > 4 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-950 text-slate-500 border border-slate-800">
                    +{m.skills.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card Footer: Social Icons & Profile Link */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-400">
            {m.socialLinks?.linkedin && (
              <a 
                href={m.socialLinks.linkedin} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-sky-400 transition-colors p-1 rounded hover:bg-slate-800"
                title="LinkedIn Profile"
                onClick={(e) => e.stopPropagation()}
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {m.socialLinks?.github && (
              <a 
                href={m.socialLinks.github} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-white transition-colors p-1 rounded hover:bg-slate-800"
                title="GitHub Profile"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {m.socialLinks?.portfolio && (
              <a 
                href={m.socialLinks.portfolio} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-emerald-400 transition-colors p-1 rounded hover:bg-slate-800"
                title="Portfolio Website"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
            {m.socialLinks?.googleScholar && (
              <a 
                href={m.socialLinks.googleScholar} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-amber-400 transition-colors p-1 rounded hover:bg-slate-800"
                title="Google Scholar Citations"
                onClick={(e) => e.stopPropagation()}
              >
                <GraduationCap className="w-4 h-4" />
              </a>
            )}
            {m.socialLinks?.researchGate && (
              <a 
                href={m.socialLinks.researchGate} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-teal-400 transition-colors p-1 rounded hover:bg-slate-800"
                title="ResearchGate Profile"
                onClick={(e) => e.stopPropagation()}
              >
                <BookOpen className="w-4 h-4" />
              </a>
            )}
            {m.email && (
              <a 
                href={`mailto:${m.email}`} 
                className="hover:text-red-400 transition-colors p-1 rounded hover:bg-slate-800"
                title="Direct Email"
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>

          <button
            onClick={() => navigate(`/profile/${m.slug || m.id}`)}
            className="text-xs font-bold text-red-400 hover:text-red-300 inline-flex items-center gap-1 group/btn"
          >
            <span>View Profile</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-slate-100">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Users className="w-4 h-4" />
          <span>e-Yantra Robotics Innovation Lab LNJPIT</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Mentors, Domain Leads & Student Engineers</h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Meet the multidisciplinary team building autonomous rovers, robotic arms, computer vision pipelines, and embedded IoT systems at LNJPIT Chapra.
        </p>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: 'All Members', path: '/team', cat: 'all' },
            { label: 'Club_Head', path: '/team/faculty', cat: 'faculty' },
            { label: 'Technical Domain Leads', path: '/team/technical-leads', cat: 'leads' },
            { label: 'Student Leadership', path: '/team/coordinators', cat: 'coordinators' },
            { label: 'Alumni Network', path: '/team/alumni', cat: 'alumni' },
          ].map(tab => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                categoryFilter === tab.cat
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/40'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, skills..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Loading verified team member profiles...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* SECTION 1: FACULTY MEMBERS */}
          {(categoryFilter === 'all' || categoryFilter === 'faculty') && facultyMembers.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-l-4 border-red-600 pl-3">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Club_Head</h2>
                  <p className="text-xs text-slate-400">Institutional leadership guiding robotics research, grants, and IIT Bombay e-Yantra lab initiatives.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {facultyMembers.map(renderMemberCard)}
              </div>
            </section>
          )}

          {/* SECTION 2: TECHNICAL DOMAIN LEADS */}
          {(categoryFilter === 'all' || categoryFilter === 'leads') && technicalLeadsList.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-l-4 border-sky-500 pl-3">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Domain Technical Leads</h2>
                  <p className="text-xs text-slate-400">Specialist engineering leads driving Autonomous Navigation, ROS 2, Embedded Systems, and Edge AI.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {technicalLeadsList.map(renderMemberCard)}
              </div>
            </section>
          )}

          {/* SECTION 3: STUDENT COORDINATORS */}
          {(categoryFilter === 'all' || categoryFilter === 'coordinators') && studentCoordinators.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-l-4 border-amber-500 pl-3">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Student Coordinators & Operations</h2>
                  <p className="text-xs text-slate-400">Managing national eYRC competition training, bootcamps, workshops, and lab inventory.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {studentCoordinators.map(renderMemberCard)}
              </div>
            </section>
          )}

          {/* SECTION 4: PROJECT LEADS & CORE MEMBERS */}
          {categoryFilter === 'all' && projectLeadsAndMembers.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-l-4 border-emerald-500 pl-3">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Project Leads & Core Team Members</h2>
                  <p className="text-xs text-slate-400">Hardware engineers, firmware developers, and robotics researchers across all batches.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {projectLeadsAndMembers.map(renderMemberCard)}
              </div>
            </section>
          )}

          {/* SECTION 5: ALUMNI & TESTIMONIALS */}
          {(categoryFilter === 'all' || categoryFilter === 'alumni') && testimonials.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-l-4 border-purple-500 pl-3">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Alumni Network & Testimonials</h2>
                  <p className="text-xs text-slate-400">Former student leaders and e-Yantra alumni who shaped the laboratory.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map(t => (
                  <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img src={t.photo} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-600/50" />
                        <div>
                          <h4 className="font-bold text-white text-sm">{t.name}</h4>
                          <p className="text-xs text-purple-400">{t.role} ({t.year})</p>
                          <p className="text-[11px] text-slate-400">{t.company}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 italic leading-relaxed">"{t.content}"</p>
                    </div>

                    {t.linkedin && (
                      <div className="pt-3 border-t border-slate-800/80">
                        <a 
                          href={t.linkedin} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5"
                        >
                          <Linkedin className="w-3.5 h-3.5" />
                          <span>Connect on LinkedIn</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {filteredMembers.length === 0 && (
            <div className="p-16 text-center text-slate-400 space-y-3 bg-slate-900 border border-slate-800 rounded-2xl">
              <Users className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-white">No team members match your criteria.</p>
              <p className="text-xs text-slate-500">Try searching for a different name, skill, or role category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamView;
