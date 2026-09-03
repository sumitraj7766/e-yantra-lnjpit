import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, FolderGit2, Calendar, FileText, 
  Settings, CheckCircle2, XCircle, Trash2, Plus, 
  Mail, Activity, BarChart2, Bell, Sparkles, Megaphone,
  UserCheck, Search, Download, Check
} from 'lucide-react';
import { 
  User, FacultyMember, StudentCoordinator, TechnicalLead, 
  Project, EventItem, CommunityApplication, BlogPost, 
  ContactMessage, AuditLog, SiteSettings 
} from '../../types';
import { TeamManagementTab } from '../admin/TeamManagementTab';
import { safeFetchJson, safeParseResponse } from '../../utils/api';

interface AdminDashboardViewProps {
  user: User | null;
  faculty?: FacultyMember[];
  coordinators?: StudentCoordinator[];
  technicalLeads?: TechnicalLead[];
  projects?: Project[];
  events?: EventItem[];
  applications?: CommunityApplication[];
  blogPosts?: BlogPost[];
  blog?: BlogPost[];
  gallery?: any[];
  resources?: any[];
  achievements?: any[];
  contactMessages?: ContactMessage[];
  auditLogs?: AuditLog[];
  settings?: SiteSettings;
  refreshData?: () => void;
  navigate?: (path: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  user,
  faculty = [],
  coordinators = [],
  technicalLeads = [],
  projects = [],
  events = [],
  applications = [],
  blogPosts,
  blog = [],
  contactMessages = [],
  auditLogs = [],
  settings,
  refreshData = () => {},
  navigate
}) => {
  const allBlogPosts = blogPosts || blog || [];

  const getAdminToken = () => {
    return localStorage.getItem('eyantra_jwt_token') || localStorage.getItem('eyantra_token') || '';
  };

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' && user.role !== 'FACULTY')) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-950/50 border border-red-800/50 text-red-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Admin Authentication Required</h2>
        <p className="text-xs text-slate-400">Please sign in through the Admin Portal with valid credentials to access the e-Yantra LNJPIT Control Center.</p>
        <button
          onClick={() => navigate ? navigate('/') : window.location.href = '/'}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const [activeSection, setActiveSection] = useState<
    'overview' | 'team' | 'applications' | 'registrations' | 'users' | 'faculty' | 'coordinators' | 'projects' | 'events' | 'blog' | 'messages' | 'logs' | 'settings'
  >('overview');

  const [analytics, setAnalytics] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Registrations state
  const [registrationsList, setRegistrationsList] = useState<any[]>([]);
  const [regSearchQuery, setRegSearchQuery] = useState('');
  const [regEventFilter, setRegEventFilter] = useState('ALL');
  const [regStatusFilter, setRegStatusFilter] = useState('ALL');
  const [loadingRegs, setLoadingRegs] = useState(false);

  // Users Management state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchRegistrations = async () => {
    setLoadingRegs(true);
    try {
      const data = await safeFetchJson('/api/registrations', {
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      if (Array.isArray(data)) {
        setRegistrationsList(data);
      }
    } catch (e) {
      console.error('Failed to fetch registrations', e);
    } finally {
      setLoadingRegs(false);
    }
  };

  const fetchUsersList = async () => {
    setLoadingUsers(true);
    try {
      const data = await safeFetchJson('/api/users', {
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      if (Array.isArray(data)) {
        setUsersList(data);
      }
    } catch (e) {
      console.error('Failed to fetch users', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'registrations') {
      fetchRegistrations();
    } else if (activeSection === 'users') {
      fetchUsersList();
    }
  }, [activeSection]);

  const handleUpdateRegStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/registrations/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchRegistrations();
        refreshData();
      }
    } catch (e) {
      alert('Failed to update registration status');
    }
  };

  const handleUpdateRegAttendance = async (id: string, attendance: string) => {
    try {
      const res = await fetch(`/api/registrations/${id}/attendance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({ attendance })
      });
      if (res.ok) {
        fetchRegistrations();
        refreshData();
      }
    } catch (e) {
      alert('Failed to update attendance');
    }
  };

  const handleDeleteReg = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this registration?')) return;
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      if (res.ok) {
        fetchRegistrations();
        refreshData();
      }
    } catch (e) {
      alert('Failed to delete registration');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        fetchUsersList();
        refreshData();
      }
    } catch (e) {
      alert('Failed to update user role');
    }
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchUsersList();
        refreshData();
      }
    } catch (e) {
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      if (res.ok) {
        fetchUsersList();
        refreshData();
      } else {
        const { data: d } = await safeParseResponse(res);
        alert(d?.error || 'Failed to delete user');
      }
    } catch (e) {
      alert('Failed to delete user');
    }
  };

  const exportRegistrationsCSV = () => {
    if (registrationsList.length === 0) return alert('No registrations to export');
    const headers = ['Registration ID', 'Event Title', 'Full Name', 'Email', 'Phone', 'College', 'Department', 'Year', 'Roll Number', 'Team Name', 'Status', 'Attendance', 'Registered At'];
    const rows = registrationsList.map(r => [
      `"${r.registrationId || r.id}"`,
      `"${r.eventTitle || ''}"`,
      `"${r.fullName || r.name || ''}"`,
      `"${r.email || ''}"`,
      `"${r.phone || ''}"`,
      `"${r.college || ''}"`,
      `"${r.department || r.branch || ''}"`,
      `"${r.year || ''}"`,
      `"${r.rollNumber || r.rollNo || ''}"`,
      `"${r.teamName || ''}"`,
      `"${r.status || ''}"`,
      `"${r.attendance || 'PENDING'}"`,
      `"${new Date(r.registeredAt || r.createdAt).toLocaleString()}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eYantra_Event_Registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Modals state
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [facName, setFacName] = useState('');
  const [facDesig, setFacDesig] = useState('');
  const [facDept, setFacDept] = useState('Electronics & Communication Engineering');
  const [facEmail, setFacEmail] = useState('');
  const [facBio, setFacBio] = useState('');

  const [showEventModal, setShowEventModal] = useState(false);
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtDate, setEvtDate] = useState('2026-09-20');
  const [evtVenue, setEvtVenue] = useState('LNJPIT Main Auditorium & e-Yantra Lab');
  const [evtCategory, setEvtCategory] = useState('Workshop');

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [prjTitle, setPrjTitle] = useState('');
  const [prjDesc, setPrjDesc] = useState('');
  const [prjCategory, setPrjCategory] = useState('Robotics & Kinematics');
  const [prjTech, setPrjTech] = useState('ROS 2, ESP32, Python');
  const [prjStatus, setPrjStatus] = useState('Development');
  const [prjGithub, setPrjGithub] = useState('');

  const [showCoordModal, setShowCoordModal] = useState(false);
  const [coordName, setCoordName] = useState('');
  const [coordPos, setCoordPos] = useState('Student Coordinator');
  const [coordBranch, setCoordBranch] = useState('ECE');
  const [coordYear, setCoordYear] = useState('3rd Year');
  const [coordSkills, setCoordSkills] = useState('Robotics, C++');
  const [coordEmail, setCoordEmail] = useState('');

  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('Announcements');
  const [blogContent, setBlogContent] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('e-Yantra LNJPIT Team');

  // Settings State
  const [noticeBannerText, setNoticeBannerText] = useState(settings?.noticeBanner || '');
  const [officialEmail, setOfficialEmail] = useState(settings?.officialEmail || 'lnjpiteyantra@gmail.com');
  const [phoneText, setPhoneText] = useState(settings?.phone || '+91 6152 280000');
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (settings?.noticeBanner) setNoticeBannerText(settings.noticeBanner);
    if (settings?.officialEmail) setOfficialEmail(settings.officialEmail);
    if (settings?.phone) setPhoneText(settings.phone);
  }, [settings]);

  useEffect(() => {
    safeFetchJson('/api/analytics', {
      headers: { 'Authorization': `Bearer ${getAdminToken()}` }
    }).then(data => { if (data) setAnalytics(data); });

    safeFetchJson('/api/db-status')
      .then(data => { if (data) setDbStatus(data); });
  }, []);

  const handleAppStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({ status })
      });
      refreshData();
    } catch (err) {
      alert('Status update failed');
    }
  };

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/faculty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          name: facName,
          designation: facDesig,
          department: facDept,
          email: facEmail,
          bio: facBio
        })
      });
      setShowFacultyModal(false);
      setFacName('');
      setFacDesig('');
      setFacEmail('');
      setFacBio('');
      refreshData();
    } catch (err) {
      alert('Failed to add faculty');
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!confirm('Are you sure you want to remove this faculty record?')) return;
    try {
      await fetch(`/api/faculty/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      refreshData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          title: evtTitle,
          description: evtDesc,
          date: evtDate,
          venue: evtVenue,
          category: evtCategory
        })
      });
      setShowEventModal(false);
      setEvtTitle('');
      setEvtDesc('');
      refreshData();
    } catch (err) {
      alert('Failed to create event');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      refreshData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          title: prjTitle,
          shortDescription: prjDesc,
          category: prjCategory,
          technologies: prjTech.split(',').map(t => t.trim()).filter(Boolean),
          status: prjStatus,
          githubUrl: prjGithub
        })
      });
      setShowProjectModal(false);
      setPrjTitle('');
      setPrjDesc('');
      setPrjTech('');
      setPrjGithub('');
      refreshData();
    } catch (err) {
      alert('Failed to create project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      refreshData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleCreateCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/coordinators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          name: coordName,
          position: coordPos,
          branch: coordBranch,
          year: coordYear,
          skills: coordSkills.split(',').map(s => s.trim()).filter(Boolean),
          email: coordEmail
        })
      });
      setShowCoordModal(false);
      setCoordName('');
      setCoordPos('');
      setCoordEmail('');
      refreshData();
    } catch (err) {
      alert('Failed to add coordinator');
    }
  };

  const handleDeleteCoordinator = async (id: string) => {
    if (!confirm('Are you sure you want to remove this coordinator?')) return;
    try {
      await fetch(`/api/coordinators/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      refreshData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          title: blogTitle,
          category: blogCategory,
          content: blogContent,
          author: blogAuthor
        })
      });
      setShowBlogModal(false);
      setBlogTitle('');
      setBlogContent('');
      refreshData();
    } catch (err) {
      alert('Failed to publish post');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to remove this article?')) return;
    try {
      await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      refreshData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          noticeBanner: noticeBannerText,
          officialEmail,
          phone: phoneText
        })
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
      refreshData();
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-100">
      
      {/* Admin Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-950 border border-red-800 text-red-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Admin & Faculty Control Center
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/50">
                {user.role}
              </span>
            </h1>
            <p className="text-xs text-slate-400">Manage e-Yantra LNJPIT community records, projects, events, blog, and live announcements.</p>
          </div>
        </div>

        <button
          onClick={refreshData}
          className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold rounded-xl transition-colors"
        >
          Refresh Live Data
        </button>
      </div>

      {/* Admin Subnav */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Analytics Overview' },
          { id: 'team', label: '👥 Team & Profiles (New)' },
          { id: 'registrations', label: `Event Registrations (${registrationsList.length || 'Live'})` },
          { id: 'users', label: `Users & Roles (${usersList.length || 'Manage'})` },
          { id: 'applications', label: `Applications (${(applications || []).length})` },
          { id: 'projects', label: `Projects (${(projects || []).length})` },
          { id: 'events', label: `Events (${(events || []).length})` },
          { id: 'faculty', label: `Faculty (${(faculty || []).length})` },
          { id: 'coordinators', label: `Coordinators (${(coordinators || []).length})` },
          { id: 'blog', label: `Blog (${(allBlogPosts || []).length})` },
          { id: 'messages', label: `Messages (${(contactMessages || []).length})` },
          { id: 'settings', label: 'Site Notice & Settings' },
          { id: 'logs', label: 'Audit Logs' },
        ].map(nav => (
          <button
            key={nav.id}
            onClick={() => setActiveSection(nav.id as any)}
            className={`px-3.5 py-2 rounded-xl transition-colors ${
              activeSection === nav.id ? 'bg-red-600 text-white shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {nav.label}
          </button>
        ))}
      </div>

      {/* TEAM PROFILE MANAGEMENT TAB */}
      {activeSection === 'team' && (
        <TeamManagementTab onRefresh={refreshData} navigate={navigate} />
      )}

      {/* SECTION 1: OVERVIEW */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* MongoDB Atlas Database Status Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                🍃
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">MongoDB Atlas Database</h4>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    dbStatus?.isConnected
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                      : 'bg-amber-950 text-amber-300 border border-amber-700/50'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dbStatus?.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                    {dbStatus?.status || 'Connected'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Host: <span className="text-emerald-400 font-mono">{dbStatus?.host || 'MongoDB Atlas Serverless / Managed Cluster'}</span> • Models: <span className="text-white font-semibold">16 Mongoose Schemas</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                Env: <span className="text-emerald-400 font-mono">MONGODB_URI</span>
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 font-medium">
                Server-Side Only
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Total Projects</p>
              <p className="text-2xl font-extrabold text-white mt-1">{projects.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Community Applications</p>
              <p className="text-2xl font-extrabold text-red-400 mt-1">{applications.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Faculty Mentors</p>
              <p className="text-2xl font-extrabold text-amber-400 mt-1">{faculty.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-xs text-slate-400">Total Events</p>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1">{events.length}</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Recent Audit Activity</h3>
            <div className="space-y-2 text-xs">
              {(auditLogs || []).slice(0, 5).map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300">
                  <div>
                    <span className="font-bold text-red-400">{log.action}: </span>
                    <span>{log.targetRecord}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: APPLICATIONS */}
      {activeSection === 'applications' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <h3 className="font-bold text-white text-base">Community Join Applications Reviewer</h3>
          
          <div className="space-y-4">
            {applications.length === 0 ? (
              <p className="text-slate-400 py-4">No community applications submitted yet.</p>
            ) : (
              applications.map(app => (
                <div key={app.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{app.fullName}</h4>
                      <p className="text-slate-400">{app.email} • {app.phone} • {app.department} ({app.year})</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded font-bold uppercase text-[10px] ${
                      app.status === 'Accepted' ? 'bg-emerald-950 text-emerald-400' :
                      app.status === 'Rejected' ? 'bg-red-950 text-red-400' : 'bg-amber-950 text-amber-400'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed"><span className="font-semibold text-slate-400">Why Join: </span>{app.whyJoin}</p>

                  <div className="flex flex-wrap gap-1">
                    <span className="font-semibold text-slate-400">Domains: </span>
                    {app.domains?.map((d: string) => (
                      <span key={d} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {d}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => handleAppStatusChange(app.id, 'Accepted')}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs"
                    >
                      Accept & Create Member
                    </button>
                    <button
                      onClick={() => handleAppStatusChange(app.id, 'Shortlisted')}
                      className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 font-bold text-white text-xs"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => handleAppStatusChange(app.id, 'Rejected')}
                      className="px-3 py-1.5 rounded bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 2.5: EVENT REGISTRATIONS MANAGER */}
      {activeSection === 'registrations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-500" />
                Live Event Registrations Directory
              </h3>
              <p className="text-slate-400 text-xs">Manage participant enrollments, track capacity, update registration statuses, and record live workshop attendance.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchRegistrations}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 font-semibold text-slate-300 rounded-lg transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={exportRegistrationsCSV}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 font-bold text-white rounded-lg flex items-center gap-1.5 shadow transition-colors"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, email, roll no, team..."
                value={regSearchQuery}
                onChange={e => setRegSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <select
                value={regEventFilter}
                onChange={e => setRegEventFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none"
              >
                <option value="ALL">All Events & Workshops</option>
                {events.map(evt => (
                  <option key={evt.id} value={evt.title}>{evt.title}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={regStatusFilter}
                onChange={e => setRegStatusFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none"
              >
                <option value="ALL">All Statuses (Registered, Waitlisted, Cancelled)</option>
                <option value="REGISTERED">REGISTERED / Confirmed</option>
                <option value="WAITLISTED">WAITLISTED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          {/* Registrations List */}
          {loadingRegs ? (
            <div className="py-12 text-center text-slate-400">Loading registrations from MongoDB Atlas...</div>
          ) : (
            <div className="space-y-3">
              {registrationsList
                .filter(reg => {
                  const matchSearch = !regSearchQuery || 
                    (reg.fullName || reg.name || '').toLowerCase().includes(regSearchQuery.toLowerCase()) ||
                    (reg.email || '').toLowerCase().includes(regSearchQuery.toLowerCase()) ||
                    (reg.rollNumber || reg.rollNo || '').toLowerCase().includes(regSearchQuery.toLowerCase()) ||
                    (reg.registrationId || '').toLowerCase().includes(regSearchQuery.toLowerCase()) ||
                    (reg.teamName || '').toLowerCase().includes(regSearchQuery.toLowerCase());
                  
                  const matchEvent = regEventFilter === 'ALL' || reg.eventTitle === regEventFilter;
                  const matchStatus = regStatusFilter === 'ALL' || 
                    (regStatusFilter === 'REGISTERED' ? (reg.status === 'REGISTERED' || reg.status === 'Confirmed' || reg.status === 'APPROVED') : reg.status === regStatusFilter);

                  return matchSearch && matchEvent && matchStatus;
                })
                .map(reg => {
                  const regName = reg.fullName || reg.name || 'Anonymous Student';
                  const regStatus = reg.status || 'REGISTERED';
                  const regAttendance = reg.attendance || 'PENDING';
                  const regRoll = reg.rollNumber || reg.rollNo || 'N/A';
                  const regDept = reg.department || reg.branch || 'ECE';
                  const regYr = reg.year || '3rd Year';

                  return (
                    <div key={reg.id || reg._id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                            {reg.registrationId || `REG-${(reg.id || '').substring(0, 8)}`}
                          </span>
                          <h4 className="font-bold text-white text-sm">{regName}</h4>
                          <span className="text-slate-400">({reg.email})</span>
                          {reg.teamName && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800">
                              Team: {reg.teamName}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                            regStatus === 'REGISTERED' || regStatus === 'Confirmed' || regStatus === 'APPROVED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : regStatus === 'WAITLISTED'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}>
                            {regStatus}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            regAttendance === 'ATTENDED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : regAttendance === 'ABSENT'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}>
                            Attendance: {regAttendance}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400 text-[11px]">
                        <div><span className="text-slate-500 font-medium">Event:</span> <span className="text-white font-semibold">{reg.eventTitle}</span></div>
                        <div><span className="text-slate-500 font-medium">Dept/Roll:</span> <span className="text-white">{regDept} ({regRoll})</span></div>
                        <div><span className="text-slate-500 font-medium">Phone:</span> <span className="text-white">{reg.phone || 'N/A'}</span></div>
                        <div><span className="text-slate-500 font-medium">College:</span> <span className="text-white">{reg.college || 'LNJPIT Chapra'}</span></div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[11px]">
                        <span className="text-slate-500">
                          Registered on {new Date(reg.registeredAt || reg.createdAt).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-500 mr-1">Status:</span>
                          <button
                            onClick={() => handleUpdateRegStatus(reg.id || reg._id, 'REGISTERED')}
                            className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-semibold"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleUpdateRegStatus(reg.id || reg._id, 'WAITLISTED')}
                            className="px-2 py-1 rounded bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 font-semibold"
                          >
                            Waitlist
                          </button>

                          <span className="text-slate-500 mx-1">| Attendance:</span>
                          <button
                            onClick={() => handleUpdateRegAttendance(reg.id || reg._id, 'ATTENDED')}
                            className="px-2 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700 text-emerald-200 font-semibold"
                          >
                            Mark Attended
                          </button>
                          <button
                            onClick={() => handleUpdateRegAttendance(reg.id || reg._id, 'ABSENT')}
                            className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-semibold"
                          >
                            Mark Absent
                          </button>

                          <button
                            onClick={() => handleDeleteReg(reg.id || reg._id)}
                            className="p-1 rounded bg-red-950 hover:bg-red-900 border border-red-800 text-red-400 ml-2"
                            title="Cancel Registration"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {registrationsList.length === 0 && (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400">
                  No event registrations found yet.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2.6: USERS & ROLE MANAGEMENT */}
      {activeSection === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                User Accounts & Role-Based Access Control (RBAC)
              </h3>
              <p className="text-slate-400 text-xs">Promote members, assign Club_Head, update security roles, and monitor registered account statuses.</p>
            </div>

            <button
              onClick={fetchUsersList}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 font-semibold text-slate-300 rounded-lg transition-colors"
            >
              Refresh Users
            </button>
          </div>

          {/* Search bar */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user by name, username, email, department, or role..."
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {loadingUsers ? (
            <div className="py-12 text-center text-slate-400">Loading user accounts from MongoDB Atlas...</div>
          ) : (
            <div className="space-y-3">
              {usersList
                .filter(u => {
                  if (!userSearchQuery) return true;
                  const q = userSearchQuery.toLowerCase();
                  return (u.name || '').toLowerCase().includes(q) ||
                    (u.username || '').toLowerCase().includes(q) ||
                    (u.email || '').toLowerCase().includes(q) ||
                    (u.department || u.branch || '').toLowerCase().includes(q) ||
                    (u.role || '').toLowerCase().includes(q);
                })
                .map(u => {
                  const uName = u.name || u.username || 'User';
                  const uRole = u.role || 'STUDENT';
                  const uStatus = u.status || 'Active';

                  return (
                    <div key={u.id || u._id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white text-sm">{uName}</h4>
                          <span className="text-slate-400">(@{u.username})</span>
                          <span className="text-slate-500 text-[11px]">• {u.email}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                            uRole === 'SUPER_ADMIN' || uRole === 'ADMIN'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : uRole === 'FACULTY'
                              ? 'bg-purple-950 text-purple-400 border border-purple-800'
                              : uRole === 'TECHNICAL_LEAD' || uRole === 'COORDINATOR'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-slate-900 text-slate-300 border border-slate-800'
                          }`}>
                            {uRole}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            uStatus === 'Active'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {uStatus}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400 text-[11px]">
                        <div><span className="text-slate-500 font-medium">Department:</span> <span className="text-white">{u.department || u.branch || 'ECE'}</span></div>
                        <div><span className="text-slate-500 font-medium">Year:</span> <span className="text-white">{u.year || '3rd Year'}</span></div>
                        <div><span className="text-slate-500 font-medium">Roll No:</span> <span className="text-white">{u.rollNumber || u.rollNo || 'N/A'}</span></div>
                        <div><span className="text-slate-500 font-medium">Joined:</span> <span className="text-white">{new Date(u.joinedAt || u.createdAt).toLocaleDateString()}</span></div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">Change Role:</span>
                          <select
                            value={uRole}
                            onChange={e => handleUpdateUserRole(u.id || u._id, e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white focus:outline-none"
                          >
                            <option value="STUDENT">STUDENT</option>
                            <option value="MEMBER">MEMBER</option>
                            <option value="PROJECT_LEAD">PROJECT_LEAD</option>
                            <option value="COORDINATOR">COORDINATOR</option>
                            <option value="TECHNICAL_LEAD">TECHNICAL_LEAD</option>
                            <option value="FACULTY">FACULTY</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateUserStatus(u.id || u._id, uStatus === 'Active' ? 'Suspended' : 'Active')}
                            className={`px-2.5 py-1 rounded font-semibold text-[10px] ${
                              uStatus === 'Active'
                                ? 'bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800'
                                : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {uStatus === 'Active' ? 'Suspend Access' : 'Reactivate Access'}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id || u._id)}
                            className="p-1 rounded bg-red-950 hover:bg-red-900 border border-red-800 text-red-400"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {usersList.length === 0 && (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400">
                  No users found in database.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: PROJECTS MANAGER */}
      {activeSection === 'projects' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base">Projects & Research Management</h3>
            <button
              onClick={() => setShowProjectModal(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 font-bold text-white rounded-lg flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          </div>

          <div className="space-y-3">
            {projects.map(p => (
              <div key={p.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-sm">{p.title}</p>
                  <p className="text-slate-400">{p.category} • Status: <span className="text-red-400">{p.status}</span> • Year: {p.year}</p>
                  <p className="text-slate-500 text-[11px] line-clamp-1">{p.shortDescription}</p>
                </div>
                <button
                  onClick={() => handleDeleteProject(p.id)}
                  className="p-2 rounded bg-red-950 text-red-400 hover:bg-red-900 ml-4"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: EVENTS MANAGER */}
      {activeSection === 'events' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base">Events & Hackathons Management</h3>
            <button
              onClick={() => setShowEventModal(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 font-bold text-white rounded-lg flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Create Event
            </button>
          </div>

          <div className="space-y-3">
            {events.map(e => (
              <div key={e.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-sm">{e.title}</p>
                  <p className="text-slate-400">{e.date} • {e.venue} • {e.registeredCount} Registered</p>
                </div>
                <button
                  onClick={() => handleDeleteEvent(e.id)}
                  className="p-2 rounded bg-red-950 text-red-400 hover:bg-red-900 ml-4"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: FACULTY MANAGER */}
      {activeSection === 'faculty' && (
        <div className="space-y-4">
          <TeamManagementTab onRefresh={refreshData} navigate={navigate} initialRoleFilter="FACULTY" />
        </div>
      )}

      {/* SECTION 6: COORDINATORS MANAGER */}
      {activeSection === 'coordinators' && (
        <div className="space-y-4">
          <TeamManagementTab onRefresh={refreshData} navigate={navigate} initialRoleFilter="COORDINATOR" />
        </div>
      )}

      {/* SECTION 7: BLOG & ANNOUNCEMENTS */}
      {activeSection === 'blog' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base">Blog Posts & Announcements</h3>
            <button
              onClick={() => setShowBlogModal(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 font-bold text-white rounded-lg flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Publish Post
            </button>
          </div>

          <div className="space-y-3">
            {allBlogPosts.map(b => (
              <div key={b.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-sm">{b.title}</p>
                  <p className="text-slate-400">{b.category} • By {b.author} • {b.publishDate}</p>
                </div>
                <button
                  onClick={() => handleDeleteBlog(b.id)}
                  className="p-2 rounded bg-red-950 text-red-400 hover:bg-red-900 ml-4"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 8: MESSAGES */}
      {activeSection === 'messages' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <h3 className="font-bold text-white text-base">Official Contact Inbox</h3>
          <div className="space-y-3">
            {contactMessages.length === 0 ? (
              <p className="text-slate-400 py-4">No contact messages yet.</p>
            ) : (
              contactMessages.map(m => (
                <div key={m.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex justify-between font-bold text-white">
                    <span>{m.name} ({m.email})</span>
                    <span className="text-slate-500 text-[10px]">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-red-400 font-semibold">{m.subject}</p>
                  <p className="text-slate-300 leading-relaxed">{m.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 9: SITE NOTICE & SETTINGS */}
      {activeSection === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-base">Live Site Announcements & Contact Info</h3>
              <p className="text-slate-400">Update the top announcement banner and official e-Yantra contact details in real-time.</p>
            </div>
            {settingsSaved && (
              <span className="px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
            <div>
              <label className="block font-semibold text-white mb-1 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-red-500" />
                Live Top Notice Banner
              </label>
              <textarea
                rows={2}
                value={noticeBannerText}
                onChange={e => setNoticeBannerText(e.target.value)}
                placeholder="e.g. 🚀 Registration Open: e-LNJPIT HackRobotics 2026!"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">This text appears at the very top of every page across the entire platform.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-white mb-1">Official Email</label>
                <input
                  type="email"
                  value={officialEmail}
                  onChange={e => setOfficialEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-white mb-1">Official Phone</label>
                <input
                  type="text"
                  value={phoneText}
                  onChange={e => setPhoneText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 font-bold text-white rounded-xl shadow transition-colors"
            >
              Save & Apply Platform Settings
            </button>
          </form>
        </div>
      )}

      {/* SECTION 10: LOGS */}
      {activeSection === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 text-xs">
          <h3 className="font-bold text-white text-base">Security & Administrative Audit Trail</h3>
          <div className="space-y-2">
            {auditLogs.map(l => (
              <div key={l.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between text-slate-300">
                <div>
                  <span className="font-bold text-red-400">{l.user}: </span>
                  <span>{l.action} on {l.targetRecord}</span>
                </div>
                <span className="text-slate-500 text-[10px]">{new Date(l.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD PROJECT */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-100 text-xs">
            <h3 className="font-bold text-white text-base">Add New Technology Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Project Title</label>
                <input
                  type="text"
                  value={prjTitle}
                  onChange={e => setPrjTitle(e.target.value)}
                  placeholder="e.g. Autonomous Agricultural Rover"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Category</label>
                <input
                  type="text"
                  value={prjCategory}
                  onChange={e => setPrjCategory(e.target.value)}
                  placeholder="e.g. Robotics & Kinematics"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={prjDesc}
                  onChange={e => setPrjDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Technologies (comma separated)</label>
                <input
                  type="text"
                  value={prjTech}
                  onChange={e => setPrjTech(e.target.value)}
                  placeholder="ROS 2, Python, ESP32"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">GitHub Repo URL</label>
                <input
                  type="text"
                  value={prjGithub}
                  onChange={e => setPrjGithub(e.target.value)}
                  placeholder="https://github.com/eyantra-lnjpit/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-3 py-2 bg-slate-950 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded"
                >
                  Publish Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD FACULTY */}
      {showFacultyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-100 text-xs">
            <h3 className="font-bold text-white text-base">Add New Club_Head</h3>
            <form onSubmit={handleCreateFaculty} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={facName}
                  onChange={e => setFacName(e.target.value)}
                  placeholder="e.g. Dr. A. K. Singh"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Designation</label>
                <input
                  type="text"
                  value={facDesig}
                  onChange={e => setFacDesig(e.target.value)}
                  placeholder="Assistant Professor"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={facEmail}
                  onChange={e => setFacEmail(e.target.value)}
                  placeholder="faculty@lnjpit.ac.in"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={facBio}
                  onChange={e => setFacBio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFacultyModal(false)}
                  className="px-3 py-2 bg-slate-950 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded"
                >
                  Save Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE EVENT */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-100 text-xs">
            <h3 className="font-bold text-white text-base">Create New Workshop / Competition</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Event Title</label>
                <input
                  type="text"
                  value={evtTitle}
                  onChange={e => setEvtTitle(e.target.value)}
                  placeholder="e.g. ROS 2 Navigation Bootcamp"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={evtDesc}
                  onChange={e => setEvtDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={evtDate}
                    onChange={e => setEvtDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Venue</label>
                  <input
                    type="text"
                    value={evtVenue}
                    onChange={e => setEvtVenue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-3 py-2 bg-slate-950 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD COORDINATOR */}
      {showCoordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-100 text-xs">
            <h3 className="font-bold text-white text-base">Add Student Coordinator</h3>
            <form onSubmit={handleCreateCoordinator} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={coordName}
                  onChange={e => setCoordName(e.target.value)}
                  placeholder="e.g. Saurabh Kumar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Position / Role</label>
                <input
                  type="text"
                  value={coordPos}
                  onChange={e => setCoordPos(e.target.value)}
                  placeholder="e.g. Technical Workshop Lead"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Branch</label>
                  <input
                    type="text"
                    value={coordBranch}
                    onChange={e => setCoordBranch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={coordYear}
                    onChange={e => setCoordYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={coordEmail}
                  onChange={e => setCoordEmail(e.target.value)}
                  placeholder="student@lnjpit.ac.in"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCoordModal(false)}
                  className="px-3 py-2 bg-slate-950 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded"
                >
                  Save Coordinator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PUBLISH BLOG POST */}
      {showBlogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-100 text-xs">
            <h3 className="font-bold text-white text-base">Publish Article or Announcement</h3>
            <form onSubmit={handleCreateBlog} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Article Title</label>
                <input
                  type="text"
                  value={blogTitle}
                  onChange={e => setBlogTitle(e.target.value)}
                  placeholder="e.g. Highlights of National Robotics Hackathon"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Category</label>
                <input
                  type="text"
                  value={blogCategory}
                  onChange={e => setBlogCategory(e.target.value)}
                  placeholder="Announcements / Tutorials"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Content (Markdown supported)</label>
                <textarea
                  rows={4}
                  value={blogContent}
                  onChange={e => setBlogContent(e.target.value)}
                  placeholder="Write the full announcement text or article here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlogModal(false)}
                  className="px-3 py-2 bg-slate-950 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded"
                >
                  Publish Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
