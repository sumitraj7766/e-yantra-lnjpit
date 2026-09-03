import React, { useState } from 'react';
import { Search, FolderGit2, Github, ExternalLink, Cpu, Layers, ArrowLeft, CheckCircle2, User } from 'lucide-react';
import { Project } from '../../types';

interface ProjectsViewProps {
  projects?: Project[];
  navigate: (path: string) => void;
  selectedSlug?: string;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ projects = [], navigate, selectedSlug }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // If a specific project slug is provided in route
  const currentProject = selectedSlug 
    ? (projects || []).find(p => p.slug === selectedSlug || p.id === selectedSlug)
    : null;

  const categories = ['All', 'Robotics & Agriculture', 'IoT & Smart Cities', 'Industrial Automation'];
  const statuses = ['All', 'Completed', 'Development', 'Testing', 'Idea'];

  const filteredProjects = (projects || []).filter(p => {
    const matchesCategory = categoryFilter === 'All' || p.category.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.shortDescription.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // DETAIL VIEW
  if (currentProject) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-100">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Projects
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative h-64 sm:h-96">
            <img src={currentProject.image} alt={currentProject.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase px-3 py-1 rounded bg-red-600 text-white">
                  {currentProject.category}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  Status: {currentProject.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white">{currentProject.title}</h1>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            
            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <p className="text-slate-500 font-semibold">Faculty Mentor</p>
                <p className="font-bold text-white mt-0.5">{currentProject.facultyMentor || 'e-Yantra Office'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Technical Lead</p>
                <p className="font-bold text-white mt-0.5">{currentProject.technicalLead || 'Domain Lead'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Project Lead</p>
                <p className="font-bold text-white mt-0.5">{currentProject.projectLead || 'Student Team'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-semibold">Academic Year</p>
                <p className="font-bold text-white mt-0.5">{currentProject.year}</p>
              </div>
            </div>

            {/* Overview & Problem Statement */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Problem Statement & Objective</h2>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {currentProject.problemStatement || currentProject.shortDescription}
              </p>
            </div>

            {/* Proposed Solution */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Engineering Solution</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {currentProject.solution || currentProject.shortDescription}
              </p>
            </div>

            {/* Hardware & Software Stacks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> Hardware & Sensor Modules
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {(currentProject.hardware || (currentProject as any).hardwareComponents || []).map((h: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Software & Frameworks
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {(currentProject.software || (currentProject as any).softwareStack || []).map((s: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white">Project Team Hierarchy</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(currentProject.teamMembers || []).map((m: any, i: number) => {
                  const memberName = typeof m === 'string' ? m : (m?.name || 'Team Member');
                  const memberRole = typeof m === 'object' && m?.role ? m.role : 'Member';
                  return (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                      <User className="w-5 h-5 text-red-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">{memberName}</p>
                        <p className="text-[11px] text-slate-400">{memberRole}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions / Repos */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-4">
              {currentProject.githubUrl && (
                <a
                  href={currentProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 font-semibold text-xs text-white flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Repository</span>
                </a>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-100">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">e-Yantra Projects</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Student Engineering Projects</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Explore autonomous rovers, IoT networks, computer vision tools, and industrial robotics developed at LNJPIT Chapra.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects or technologies..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                categoryFilter === cat ? 'bg-red-600 text-white' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
        >
          <option value="All">All Statuses</option>
          {statuses.slice(1).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <div
            key={project.id}
            onClick={() => navigate(`/projects/${project.slug}`)}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-red-800 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 overflow-hidden bg-slate-950">
                <img
                  src={project.image || (project as any).coverImage || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800'}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-slate-950/90 text-red-400 border border-red-800/50">
                  {project.status || 'Ongoing'}
                </span>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2">
                  {project.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {project.shortDescription}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {(project.technologies || (project as any).tags || (project as any).softwareStack || []).slice(0, 4).map((tech: string) => (
                    <span key={tech} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
              <span>Academic Year: {project.year}</span>
              <span className="text-red-400 font-semibold flex items-center gap-1">View Project ›</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
