import React from 'react';
import { 
  Cpu, ArrowRight, ShieldCheck, Sparkles, Trophy, Calendar, 
  ChevronRight, Users, Flame, Lightbulb, Rocket, CheckCircle2, 
  Layers, MapPin, ExternalLink, Activity
} from 'lucide-react';
import { Project, EventItem, FacultyMember, StudentCoordinator, Achievement, GalleryItem } from '../../types';

interface HomeViewProps {
  navigate: (path: string) => void;
  projects?: Project[];
  events?: EventItem[];
  faculty?: FacultyMember[];
  coordinators?: StudentCoordinator[];
  achievements?: Achievement[];
  gallery?: GalleryItem[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  navigate,
  projects = [],
  events = [],
  faculty = [],
  coordinators = [],
  achievements = [],
  gallery = []
}) => {
  const featuredProjects = (projects || []).filter(p => p.isFeatured).length > 0
    ? (projects || []).filter(p => p.isFeatured).slice(0, 3)
    : (projects || []).slice(0, 3);
  const upcomingEvents = (events || []).filter(e => e.status === 'Registration Open' || e.status === 'Upcoming').slice(0, 3);

  const focusDomains = [
    { name: 'Robotics & Automation', icon: '🤖', desc: 'ROS 2, mobile kinematics, SLAM, RPLIDAR, differential drives.' },
    { name: 'Embedded Systems', icon: '⚡', desc: 'STM32, ESP32, FreeRTOS multi-threading, custom double-layer PCBs.' },
    { name: 'IoT & Sensor Grids', icon: '🌐', desc: 'LoRaWAN long-range telemetry, ESP-NOW mesh, Grafana dashboards.' },
    { name: 'AI & Computer Vision', icon: '👁️', desc: 'YOLOv8 leaf blight detection, PyTorch, visual servoing.' },
    { name: 'Programming & Firmware', icon: '💻', desc: 'Embedded C++, Python scripting, Linux real-time kernels, Git.' },
    { name: 'Electronics & CAD', icon: '🛠️', desc: 'SolidWorks 3D chassis design, motor controllers, sensor fusion.' }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 text-slate-100">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden bg-slate-950 border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-red-800/60 text-red-400 text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span>Official Technical Community • LNJPIT Chapra, Bihar</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                e-Yantra <span className="bg-gradient-to-r from-red-500 via-red-400 to-amber-300 bg-clip-text text-transparent">LNJPIT</span>
              </h1>

              <p className="text-base sm:text-xl font-medium text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Empowering Innovation, Robotics & Engineering Excellence at Lok Nayak Jai Prakash Institute of Technology (LNJPIT), Chapra.
              </p>

              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                A student-driven robotics and technology community focused on hands-on engineering, ROS 2 navigation, embedded systems, computer vision, and real-world problem solving.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => navigate('/join')}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-xl shadow-red-950/60 transition-all flex items-center gap-2 group"
                >
                  <span>Join the Community</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('/projects')}
                  className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-sm transition-colors flex items-center gap-2"
                >
                  <span>Explore Projects</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => navigate('/events')}
                  className="px-4 py-3.5 rounded-xl bg-red-950/40 hover:bg-red-950/80 text-red-300 border border-red-800/60 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-red-500" />
                  <span>Upcoming Events</span>
                </button>
              </div>

              {/* Stats highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-900 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-white">150+</p>
                  <p className="text-[11px] text-slate-400">Student Engineers</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-red-400">12+</p>
                  <p className="text-[11px] text-slate-400">Active Projects</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-amber-400">Top 10</p>
                  <p className="text-[11px] text-slate-400">National Finalists</p>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-2 shadow-2xl overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800" 
                  alt="e-Yantra LNJPIT Autonomous Rover" 
                  className="w-full h-[320px] sm:h-[400px] object-cover rounded-xl filter brightness-90 group-hover:scale-102 transition-transform duration-500"
                />
                
                {/* Floating Tech Badges */}
                <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <div>
                    <p className="font-bold text-white text-[11px]">AgriBot Rover Active</p>
                    <p className="text-[10px] text-slate-400">ROS 2 Navigation Stack</p>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 bg-slate-950/90 backdrop-blur-md border border-red-900/60 px-3 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg">
                  <ShieldCheck className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="font-bold text-white text-[11px]">LNJPIT Chapra Lab</p>
                    <p className="text-[10px] text-red-400">EEE & CSE Departments</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. ABOUT SUMMARY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest">About e-Yantra LNJPIT</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Nurturing Future Technologists & Automation Pioneers in Chapra
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                e-Yantra LNJPIT serves as the official platform for students at Lok Nayak Jai Prakash Institute of Technology to gain hands-on experience in robotics, embedded firmware, Internet of Things, and artificial intelligence. Guided by faculty mentors and student leads, we bridge the gap between classroom theory and real-world industrial systems.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-red-500" /> Hands-on Bootcamps</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-red-500" /> State-of-the-Art Lab</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-red-500" /> Hackathons & Grants</span>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Key Achievements at a Glance
              </h3>
              {(achievements || []).slice(0, 2).map(ach => (
                <div key={ach.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <p className="font-semibold text-slate-200">{ach.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{ach.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOCUS AREAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Technical Domains & Focus Areas</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Our student community operates across six major specialized engineering domains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {focusDomains.map((domain, idx) => (
            <div 
              key={idx} 
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-red-900/80 transition-all hover:-translate-y-1 group"
            >
              <div className="text-3xl mb-3">{domain.icon}</div>
              <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                {domain.name}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {domain.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PROJECTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Featured Engineering Projects</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Real-world hardware and software engineered by LNJPIT students.</p>
          </div>
          <button 
            onClick={() => navigate('/projects')} 
            className="text-xs sm:text-sm font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProjects.map(project => (
            <div 
              key={project.id} 
              onClick={() => navigate(`/projects/${project.slug}`)}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-red-800/80 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-950">
                  <img 
                    src={project.image || (project as any).coverImage || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800'} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-slate-950/90 text-red-400 border border-red-800/50">
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

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(project.technologies || (project as any).tags || (project as any).softwareStack || []).slice(0, 4).map((tech: string) => (
                      <span key={tech} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-800/80 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
                <span>Lead: {project.projectLead || (project as any).leadName || 'Student Team'}</span>
                <span className="text-red-400 font-semibold flex items-center gap-1">Details ›</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. UPCOMING EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-red-500" />
                Upcoming Events & Workshops
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Register for hands-on bootcamps, hackathons, and technical lectures.</p>
            </div>
            <button 
              onClick={() => navigate('/events')} 
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors"
            >
              Browse All Events
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map(evt => (
              <div key={evt.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-red-400">{evt.category}</span>
                    <span className="text-slate-400">{evt.date} • {evt.startTime}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{evt.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{evt.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Venue: {evt.venue}</span>
                  <button 
                    onClick={() => navigate(`/events/${evt.slug}`)}
                    className="px-3 py-1.5 rounded bg-red-950 hover:bg-red-900 text-red-300 font-semibold border border-red-800/60"
                  >
                    Register Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FACULTY & LEADERSHIP PREVIEW */}
      

      {/* 7. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border border-red-900/60 rounded-2xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Ready to Build the Future of Engineering at LNJPIT?
          </h2>
          <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join e-Yantra LNJPIT today! Gain lab access, work on high-impact projects, represent our institute in national competitions, and learn directly from peer mentors.
          </p>
          <div>
            <button
              onClick={() => navigate('/join')}
              className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-xl shadow-red-950 transition-all inline-flex items-center gap-2"
            >
              <span>Submit Join Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
