import React, { useState } from 'react';
import { Mail, Linkedin, Github, GraduationCap, Award, BookOpen, Layers, X, ExternalLink } from 'lucide-react';
import { FacultyMember, StudentCoordinator, TechnicalLead, Testimonial } from '../../types';

interface TeamViewProps {
  currentPath?: string;
  navigate: (path: string) => void;
  faculty?: FacultyMember[];
  coordinators?: StudentCoordinator[];
  technicalLeads?: TechnicalLead[];
  testimonials?: Testimonial[];
  subRoute?: 'faculty' | 'coordinators' | 'technical-leads' | 'alumni';
}

export const TeamView: React.FC<TeamViewProps> = ({
  currentPath = '/team',
  navigate,
  faculty = [],
  coordinators = [],
  technicalLeads = [],
  testimonials = [],
  subRoute
}) => {
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [selectedCoordinator, setSelectedCoordinator] = useState<StudentCoordinator | null>(null);
  const [selectedLead, setSelectedLead] = useState<TechnicalLead | null>(null);

  // Determine active category filter
  let categoryFilter = subRoute || 'all';
  if (currentPath === '/team/faculty') categoryFilter = 'faculty';
  if (currentPath === '/team/coordinators') categoryFilter = 'coordinators';
  if (currentPath === '/team/technical-leads') categoryFilter = 'leads';
  if (currentPath === '/team/alumni') categoryFilter = 'alumni';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-slate-100">
      
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">e-Yantra LNJPIT Team</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Mentors, Student Leaders & Domain Experts</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Meet the dedicated team powering robotics and engineering innovation at LNJPIT Chapra.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-800 pb-4">
        {[
          { label: 'All Team Members', path: '/team', cat: 'all' },
          { label: 'Faculty Coordinators', path: '/team/faculty', cat: 'faculty' },
          { label: 'Student Leadership', path: '/team/coordinators', cat: 'coordinators' },
          { label: 'Technical Leads', path: '/team/technical-leads', cat: 'leads' },
          { label: 'Alumni Network', path: '/team/alumni', cat: 'alumni' },
        ].map(tab => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
              categoryFilter === tab.cat
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: FACULTY MEMBERS */}
      {(categoryFilter === 'all' || categoryFilter === 'faculty') && (
        <section className="space-y-6">
          <h2 className="text-xl font-extrabold text-white border-l-4 border-red-600 pl-3">
            Faculty Coordinators & Mentors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {faculty.map(fac => (
              <div 
                key={fac.id} 
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg hover:border-red-900/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <img src={fac.photo} alt={fac.name} className="w-24 h-24 rounded-full object-cover ring-2 ring-red-600/50 mb-4" />
                  <h3 className="text-lg font-bold text-white">{fac.name}</h3>
                  <p className="text-xs font-semibold text-red-400">{fac.designation}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{fac.department}</p>
                  <p className="text-[11px] text-slate-500 font-medium italic mt-1">{fac.qualification}</p>

                  <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed">{fac.bio}</p>

                  <div className="pt-3">
                    <p className="text-[11px] font-bold text-slate-400 mb-1">Areas of Expertise:</p>
                    <div className="flex flex-wrap gap-1">
                      {(fac.expertise || []).map(exp => (
                        <span key={exp} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <a href={`mailto:${fac.email}`} className="text-slate-400 hover:text-red-400 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                  <button
                    onClick={() => setSelectedFaculty(fac)}
                    className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                  >
                    <span>Full Profile ›</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: STUDENT COORDINATORS */}
      {(categoryFilter === 'all' || categoryFilter === 'coordinators') && (
        <section className="space-y-6">
          <h2 className="text-xl font-extrabold text-white border-l-4 border-amber-500 pl-3">
            Student Leadership & Coordinators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coordinators.map(coord => (
              <div key={coord.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
                <div>
                  <img src={coord.photo} alt={coord.name} className="w-20 h-20 rounded-full object-cover ring-2 ring-amber-500/50 mb-3" />
                  <div>
                    <h3 className="text-lg font-bold text-white">{coord.name}</h3>
                    <p className="text-xs font-semibold text-amber-400">{coord.position}</p>
                    <p className="text-[11px] text-slate-400">{coord.branch} • {coord.year}</p>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2 line-clamp-3">{coord.bio}</p>

                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-slate-400 mb-1">Key Responsibilities:</p>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {(coord.responsibilities || []).slice(0, 3).map((resp, i) => (
                        <li key={i}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-400">
                    {coord.github && (
                      <a href={coord.github} target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {coord.linkedin && (
                      <a href={coord.linkedin} target="_blank" rel="noreferrer" className="hover:text-sky-400 flex items-center gap-1">
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedCoordinator(coord)}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <span>Full Profile ›</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

     
      {/* SECTION 4: ALUMNI */}
      {(categoryFilter === 'all' || categoryFilter === 'alumni') && (
        <section className="space-y-6">
          <h2 className="text-xl font-extrabold text-white border-l-4 border-emerald-500 pl-3">
            Alumni Testimonials & Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map(tst => (
              <div key={tst.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <img src={tst.avatar} alt={tst.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h3 className="font-bold text-white text-sm">{tst.name}</h3>
                    <p className="text-xs text-emerald-400">{tst.role} • {tst.batch}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">"{tst.content}"</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Faculty Modal */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 relative text-slate-100 shadow-2xl">
            <button
              onClick={() => setSelectedFaculty(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <img src={selectedFaculty.photo} alt={selectedFaculty.name} className="w-20 h-20 rounded-full object-cover ring-2 ring-red-600" />
              <div>
                <h3 className="text-xl font-bold text-white">{selectedFaculty.name}</h3>
                <p className="text-xs font-semibold text-red-400">{selectedFaculty.designation}</p>
                <p className="text-xs text-slate-400">{selectedFaculty.department}</p>
                <p className="text-xs text-slate-400">{selectedFaculty.email}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-white mb-1">Biography</h4>
                <p className="text-slate-300 leading-relaxed">{selectedFaculty.bio}</p>
              </div>

              {selectedFaculty.publications && selectedFaculty.publications.length > 0 && (
                <div>
                  <h4 className="font-bold text-white mb-1">Selected Publications & Research</h4>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {selectedFaculty.publications.map((pub, i) => (
                      <li key={i}>{pub}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student Coordinator Modal */}
      {selectedCoordinator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 relative text-slate-100 shadow-2xl">
            <button
              onClick={() => setSelectedCoordinator(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <img src={selectedCoordinator.photo} alt={selectedCoordinator.name} className="w-20 h-20 rounded-full object-cover ring-2 ring-amber-500" />
              <div>
                <h3 className="text-xl font-bold text-white">{selectedCoordinator.name}</h3>
                <p className="text-xs font-semibold text-amber-400">{selectedCoordinator.position}</p>
                <p className="text-xs text-slate-400">{selectedCoordinator.branch} • {selectedCoordinator.year}</p>
                <p className="text-xs text-slate-400">{selectedCoordinator.email}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-white mb-1">About Leadership Role</h4>
                <p className="text-slate-300 leading-relaxed">{selectedCoordinator.bio}</p>
              </div>

              {selectedCoordinator.responsibilities && selectedCoordinator.responsibilities.length > 0 && (
                <div>
                  <h4 className="font-bold text-white mb-1">Key Responsibilities</h4>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {selectedCoordinator.responsibilities.map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCoordinator.skills && selectedCoordinator.skills.length > 0 && (
                <div>
                  <h4 className="font-bold text-white mb-1">Core Technical Skills</h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedCoordinator.skills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-amber-900/50 text-[10px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center gap-4">
                {selectedCoordinator.github && (
                  <a href={selectedCoordinator.github} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white flex items-center gap-1">
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                )}
                {selectedCoordinator.linkedin && (
                  <a href={selectedCoordinator.linkedin} target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300 flex items-center gap-1">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                )}
                <a href={`mailto:${selectedCoordinator.email}`} className="text-slate-400 hover:text-red-400 flex items-center gap-1 ml-auto">
                  <Mail className="w-4 h-4" /> Contact Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technical Lead Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 relative text-slate-100 shadow-2xl">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <img src={selectedLead.photo} alt={selectedLead.name} className="w-20 h-20 rounded-full object-cover ring-2 ring-sky-500" />
              <div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                  {selectedLead.domain} Domain Lead
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedLead.name}</h3>
                <p className="text-xs font-semibold text-sky-400">{selectedLead.position}</p>
                <p className="text-xs text-slate-400">{selectedLead.branch} • {selectedLead.year}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-white mb-1">Domain Profile</h4>
                <p className="text-slate-300 leading-relaxed">{selectedLead.bio}</p>
              </div>

              {selectedLead.skills && selectedLead.skills.length > 0 && (
                <div>
                  <h4 className="font-bold text-white mb-1">Technical Stack & Domain Focus</h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedLead.skills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-sky-400 border border-sky-900/50 text-[10px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {selectedLead.github && (
                    <a href={selectedLead.github} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white flex items-center gap-1">
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                  )}
                  {selectedLead.linkedin && (
                    <a href={selectedLead.linkedin} target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300 flex items-center gap-1">
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </a>
                  )}
                </div>
                <button
                  onClick={() => {
                    const handle = selectedLead.name.toLowerCase().replace(/\s+/g, '_');
                    setSelectedLead(null);
                    navigate(`/profile/${handle}`);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/80 hover:bg-sky-900 text-xs font-semibold flex items-center gap-1"
                >
                  <span>Open Full Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
