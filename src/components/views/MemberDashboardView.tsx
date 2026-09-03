import React, { useState } from 'react';
import { User as UserIcon, FolderGit2, Calendar, Bell, Plus, CheckCircle2, ShieldAlert } from 'lucide-react';
import { User, Project, EventRegistration, CommunityApplication, Notification } from '../../types';
import { safeParseResponse } from '../../utils/api';

interface MemberDashboardViewProps {
  user: User | null;
  projects?: Project[];
  registrations?: EventRegistration[];
  applications?: CommunityApplication[];
  notifications?: Notification[];
  navigate?: (path: string) => void;
}

export const MemberDashboardView: React.FC<MemberDashboardViewProps> = ({
  user,
  projects = [],
  registrations = [],
  applications = [],
  notifications = [],
  navigate
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'submitProject' | 'myEvents' | 'myApps'>('profile');

  // Submit Project Form State
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [category, setCategory] = useState('Robotics & Kinematics');
  const [technologies, setTechnologies] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <p className="text-xs text-slate-400">Please sign in or register to access your e-Yantra LNJPIT member dashboard.</p>
      </div>
    );
  }

  const myProjects = (projects || []).filter(p => {
    const userName = (user?.name || '').toLowerCase();
    if (!userName) return false;

    const matchesLead = typeof p.projectLead === 'string' && p.projectLead.toLowerCase() === userName;
    const matchesTeam = Array.isArray(p.teamMembers) && p.teamMembers.some((m: any) => {
      if (!m) return false;
      const memberName = typeof m === 'string' ? m : (m.name || '');
      return memberName.toLowerCase() === userName;
    });

    return matchesLead || matchesTeam;
  });
  const myApps = (applications || []).filter(a => a.email?.toLowerCase() === user.email?.toLowerCase());

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !shortDescription) return;

    setLoading(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/projects/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('eyantra_jwt_token') || localStorage.getItem('eyantra_token')}`
        },
        body: JSON.stringify({
          title,
          shortDescription,
          problemStatement,
          category,
          technologies: technologies.split(',').map(t => t.trim()).filter(Boolean),
          githubUrl
        })
      });

      const { data, error: parseErr } = await safeParseResponse(res);
      if (!res.ok || parseErr || !data) throw new Error(data?.error || parseErr || 'Failed to submit project');

      setSuccessMsg('Project submitted successfully for review!');
      setTitle('');
      setShortDescription('');
      setProblemStatement('');
      setTechnologies('');
      setGithubUrl('');
    } catch (err: any) {
      alert(err.message || 'Submission error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-100">
      
      {/* User Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"} alt={user.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-red-600" />
          <div>
            <h1 className="text-xl font-bold text-white">{user.name}</h1>
            <p className="text-xs text-slate-400">{user.email}</p>
            <span className="mt-1 inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/50">
              Role: {user.role}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {navigate && (
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-white rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-red-400" /> View & Edit Profile
            </button>
          )}
          <button
            onClick={() => setActiveTab('submitProject')}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 font-semibold text-xs text-white rounded-xl flex items-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Submit Project
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900 rounded-xl p-1 gap-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          My Profile & Stats
        </button>
        <button
          onClick={() => setActiveTab('submitProject')}
          className={`flex-1 py-2 rounded-lg transition-colors ${activeTab === 'submitProject' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Submit Project
        </button>
        <button
          onClick={() => setActiveTab('myApps')}
          className={`flex-1 py-2 rounded-lg transition-colors ${activeTab === 'myApps' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Join Status ({myApps.length})
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <p className="text-xs text-slate-400">My Submissions</p>
              <p className="text-2xl font-extrabold text-white">{myProjects.length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <p className="text-xs text-slate-400">Join Applications</p>
              <p className="text-2xl font-extrabold text-white">{myApps.length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <p className="text-xs text-slate-400">Department</p>
              <p className="text-sm font-bold text-white">{user.department || 'LNJPIT Student'}</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">My Projects</h3>
            {myProjects.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No projects submitted yet. Click "Submit Project" to add your hardware or software project.</p>
            ) : (
              <div className="space-y-3">
                {myProjects.map(p => (
                  <div key={p.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{p.title}</p>
                      <p className="text-slate-400">{p.category} • Status: {p.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SUBMIT PROJECT */}
      {activeTab === 'submitProject' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <h3 className="font-bold text-white text-base">Submit New Project for Review</h3>

          {successMsg && (
            <p className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl">{successMsg}</p>
          )}

          <form onSubmit={handleProjectSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Project Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Smart IoT Water Quality Monitoring System"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Short Description *</label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
                placeholder="Brief summary of the project..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Problem Statement & Objective</label>
              <textarea
                rows={3}
                value={problemStatement}
                onChange={e => setProblemStatement(e.target.value)}
                placeholder="Detailed problem and solution..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                >
                  <option value="Robotics & Kinematics">Robotics & Kinematics</option>
                  <option value="IoT & Smart Cities">IoT & Smart Cities</option>
                  <option value="AI & Computer Vision">AI & Computer Vision</option>
                  <option value="Industrial Automation">Industrial Automation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Technologies (comma separated)</label>
                <input
                  type="text"
                  value={technologies}
                  onChange={e => setTechnologies(e.target.value)}
                  placeholder="e.g. ESP32, MQTT, React"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">GitHub Repository Link</label>
              <input
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                placeholder="https://github.com/yourproject"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-500 font-bold text-white rounded-xl shadow"
            >
              {loading ? 'Submitting...' : 'Submit Project for Review'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: MY APPLICATIONS */}
      {activeTab === 'myApps' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <h3 className="font-bold text-white text-base">Community Application History</h3>
          {myApps.length === 0 ? (
            <p className="text-slate-500 py-4">No applications submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {myApps.map(a => (
                <div key={a.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{a.fullName}</p>
                    <p className="text-slate-400">{a.department} • Submitted: {new Date(a.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded font-bold uppercase text-[10px] ${
                    a.status === 'Accepted' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
