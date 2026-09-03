import React, { useState, useEffect } from 'react';
import {
  User as UserType,
  Project,
  EventItem
} from '../../types';
import {
  User,
  AtSign,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  Sparkles,
  Edit3,
  Save,
  X,
  Camera,
  Github,
  Linkedin,
  Globe,
  Award,
  Cpu,
  Layers,
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
  ShieldCheck,
  IdCard,
  Plus,
  Trash2,
  Lock,
  ArrowLeft
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: UserType | null;
  targetUserIdOrUsername?: string;
  navigate: (path: string) => void;
  projects?: Project[];
  events?: EventItem[];
  onUserUpdated?: (updatedUser: UserType) => void;
  onOpenAuth?: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250'
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  targetUserIdOrUsername,
  navigate,
  projects = [],
  events = [],
  onUserUpdated,
  onOpenAuth
}) => {
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'events' | 'idcard'>('overview');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
  const [editDomain, setEditDomain] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editPortfolio, setEditPortfolio] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Determine if viewer can edit this profile
  const isOwnProfile = !targetUserIdOrUsername || 
    (currentUser && (
      currentUser.id === targetUserIdOrUsername || 
      (currentUser.username && typeof targetUserIdOrUsername === 'string' && currentUser.username.toLowerCase() === targetUserIdOrUsername.toLowerCase())
    ));
  
  const canEdit = !!(currentUser && (isOwnProfile || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN'));

  // Load Profile Data
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setSaveError('');

      // If no target specified and user is logged in, show current user
      if (!targetUserIdOrUsername) {
        if (currentUser) {
          setProfileUser(currentUser);
          syncEditForm(currentUser);
          setLoading(false);
          return;
        } else {
          setLoading(false);
          return;
        }
      }

      // Fetch target user from backend public/dynamic profile endpoint
      try {
        const res = await fetch(`/api/users/public/${encodeURIComponent(targetUserIdOrUsername)}`);
        if (res.ok) {
          const data = await res.json();
          setProfileUser(data);
          syncEditForm(data);
        } else if (currentUser && (currentUser.id === targetUserIdOrUsername || currentUser.username === targetUserIdOrUsername)) {
          setProfileUser(currentUser);
          syncEditForm(currentUser);
        } else {
          setProfileUser(null);
        }
      } catch (e) {
        if (currentUser && (currentUser.id === targetUserIdOrUsername || currentUser.username === targetUserIdOrUsername)) {
          setProfileUser(currentUser);
          syncEditForm(currentUser);
        } else {
          setProfileUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [targetUserIdOrUsername, currentUser]);

  const syncEditForm = (u: UserType) => {
    setEditName(u.name || '');
    setEditUsername(u.username || (u.email ? u.email.split('@')[0] : ''));
    setEditPhone(u.phone || '');
    setEditDepartment(u.department || 'Electronics & Communication Engineering');
    setEditYear(u.year || '3rd Year');
    setEditStudentId(u.studentId || '');
    setEditDomain(u.domain || 'Robotics & Automation');
    setEditBio(u.bio || '');
    setEditAvatar(u.avatar || PRESET_AVATARS[0]);
    setEditSkills(Array.isArray(u.skills) ? u.skills : []);
    setEditGithub(u.githubUrl || '');
    setEditLinkedin(u.linkedinUrl || '');
    setEditPortfolio(u.portfolioUrl || '');
    setNewPassword('');
  };

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !editSkills.includes(trimmed)) {
      setEditSkills([...editSkills, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditSkills(editSkills.filter(s => s !== skillToRemove));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setSaveError('Image file size must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setEditAvatar(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUser) return;

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    const token = localStorage.getItem('eyantra_jwt_token') || localStorage.getItem('eyantra_token');
    if (!token) {
      setSaveError('Session expired. Please log in again to update your profile.');
      setSaving(false);
      return;
    }

    try {
      const payload: any = {
        name: editName.trim(),
        username: editUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
        phone: editPhone.trim(),
        department: editDepartment,
        year: editYear,
        studentId: editStudentId.trim(),
        domain: editDomain,
        bio: editBio.trim(),
        avatar: editAvatar,
        skills: editSkills,
        githubUrl: editGithub.trim(),
        linkedinUrl: editLinkedin.trim(),
        portfolioUrl: editPortfolio.trim()
      };

      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      const endpoint = isOwnProfile ? '/api/auth/profile' : `/api/users/${profileUser.id}`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      const updated = data.user || { ...profileUser, ...payload };
      setProfileUser(updated);
      setIsEditing(false);
      setSaveSuccess(true);
      if (isOwnProfile && onUserUpdated) {
        onUserUpdated(updated);
      }

      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save changes to database.');
    } finally {
      setSaving(false);
    }
  };

  const handleShareProfile = () => {
    const handle = profileUser?.username || profileUser?.id;
    const url = `${window.location.origin}/profile/${handle}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading Member Profile from Database...</p>
      </div>
    );
  }

  // Not logged in and no target user
  if (!profileUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-red-950/60 border border-red-800/80 flex items-center justify-center mx-auto text-red-500 shadow-xl">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">Profile Not Found</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          The requested member profile could not be found, or you need to sign in / create an account to view your personal dashboard.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-lg shadow-red-950/50"
            >
              Sign In or Create Account
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Find relevant projects for this user
  const userProjects = (projects || []).filter(p => {
    const targetName = (profileUser?.name || '').toLowerCase();
    if (!targetName) return false;

    const matchesTeam = Array.isArray(p.teamMembers) && p.teamMembers.some((m: any) => {
      if (!m) return false;
      const memberName = typeof m === 'string' ? m : (m.name || '');
      return memberName.toLowerCase().includes(targetName);
    });

    const matchesMentor = typeof p.facultyMentor === 'string' && p.facultyMentor.toLowerCase().includes(targetName);
    const matchesLead = typeof p.projectLead === 'string' && p.projectLead.toLowerCase().includes(targetName);

    return matchesTeam || matchesMentor || matchesLead;
  });

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Cover Banner */}
      <div className="relative h-56 sm:h-72 bg-gradient-to-r from-slate-950 via-red-950/40 to-slate-950 border-b border-slate-800/80 overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-between py-6 relative z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  window.history.back();
                } else {
                  navigate('/');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareProfile}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
                title="Share Profile"
              >
                {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-slate-400" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Profile'}</span>
              </button>

              {canEdit && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-950/60 transition-all cursor-pointer"
                  id="edit-profile-btn"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] tracking-widest uppercase font-mono text-red-400/80 bg-red-950/50 border border-red-900/40 px-2.5 py-1 rounded-full">
              e-Yantra LNJPIT Innovation Hub • Member Record
            </span>
          </div>
        </div>
      </div>

      {/* Main Profile Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-20 relative z-20">
        {/* Success Alert */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-800/80 text-emerald-200 text-xs flex items-center justify-between shadow-xl animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold">Profile Updated Successfully!</p>
                <p className="text-[11px] text-emerald-300/80">All personal information and photos are updated in MongoDB Atlas.</p>
              </div>
            </div>
            <button onClick={() => setSaveSuccess(false)} className="text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {saveError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/90 border border-red-800/80 text-red-200 text-xs flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2.5">
              <X className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="font-bold">Error Updating Profile</p>
                <p className="text-[11px] text-red-300/80">{saveError}</p>
              </div>
            </div>
            <button onClick={() => setSaveError('')} className="text-red-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Profile Card */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar with Badges */}
            <div className="relative group">
              <img
                src={profileUser.avatar || PRESET_AVATARS[0]}
                alt={profileUser.name}
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl object-cover ring-4 ring-slate-950 border-2 border-red-500/50 shadow-2xl bg-slate-950"
              />
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 shadow-md">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
            </div>

            {/* Core Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{profileUser.name}</h1>
                <span className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-red-950 text-red-400 border border-red-800/60">
                  {profileUser.role || 'MEMBER'}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-slate-300">
                  <AtSign className="w-3.5 h-3.5 text-red-400" />
                  {profileUser.username || (profileUser.email ? profileUser.email.split('@')[0] : 'member')}
                </span>
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  {profileUser.department || 'Electronics & Communication Engineering'}
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                  {profileUser.year || '3rd Year'}
                </span>
                {profileUser.studentId && (
                  <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    ID: {profileUser.studentId}
                  </span>
                )}
              </div>

              {/* Bio Summary */}
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl pt-2 leading-relaxed">
                {profileUser.bio || 'e-Yantra LNJPIT member passionate about robotics, embedded systems, and technological innovation.'}
              </p>

              {/* Social / Contact Links */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-3">
                <a
                  href={`mailto:${profileUser.email}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-red-400" />
                  <span>{profileUser.email}</span>
                </a>

                {profileUser.phone && (
                  <a
                    href={`tel:${profileUser.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{profileUser.phone}</span>
                  </a>
                )}

                {profileUser.githubUrl && (
                  <a
                    href={profileUser.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    <Github className="w-3.5 h-3.5 text-slate-300" />
                    <span>GitHub</span>
                  </a>
                )}

                {profileUser.linkedinUrl && (
                  <a
                    href={profileUser.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                    <span>LinkedIn</span>
                  </a>
                )}

                {profileUser.portfolioUrl && (
                  <a
                    href={profileUser.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-purple-400" />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= EDIT PROFILE MODAL / DRAWER ================= */}
        {isEditing && (
          <div className="bg-slate-900 border-2 border-red-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-950 border border-red-800 text-red-500">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Your Profile Information</h3>
                  <p className="text-xs text-slate-400">All updates are persisted directly to the MongoDB Atlas database.</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Photo Editor */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <label className="block text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-red-400" />
                  Profile Photo & Avatar
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <img
                    src={editAvatar || PRESET_AVATARS[0]}
                    alt="Preview"
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-red-500 shadow-lg bg-slate-900 shrink-0"
                  />
                  <div className="flex-1 space-y-3 w-full">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 mb-1.5">Pick from Avatar Presets:</p>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_AVATARS.map((av, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setEditAvatar(av)}
                            className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                              editAvatar === av ? 'border-red-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={av} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Image URL</label>
                        <input
                          type="url"
                          value={editAvatar}
                          onChange={e => setEditAvatar(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Or Upload from Device</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-950 file:text-red-400 hover:file:bg-red-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username / Handle</label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={editUsername}
                      onChange={e => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Academic */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Branch / Department</label>
                  <select
                    value={editDepartment}
                    onChange={e => setEditDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Academic Year</label>
                  <select
                    value={editYear}
                    onChange={e => setEditYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Faculty / In-Charge">Faculty / In-Charge</option>
                  </select>
                </div>
              </div>

              {/* Student ID & Domain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Roll No. / Student ID</label>
                  <input
                    type="text"
                    value={editStudentId}
                    onChange={e => setEditStudentId(e.target.value)}
                    placeholder="2310401"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Domain</label>
                  <select
                    value={editDomain}
                    onChange={e => setEditDomain(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Robotics & Automation">Robotics & Automation</option>
                    <option value="Embedded Systems & IoT">Embedded Systems & IoT</option>
                    <option value="ROS 2 & Autonomous Systems">ROS 2 & Autonomous Navigation</option>
                    <option value="Drone & UAV Technology">Drone & UAV Technology</option>
                    <option value="Edge AI & Computer Vision">Edge AI & Computer Vision</option>
                  </select>
                </div>
              </div>

              {/* Bio / About */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bio / About Me</label>
                <textarea
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  rows={3}
                  placeholder="Share a brief statement about your engineering interests, achievements, and aspirations in e-Yantra..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Technical Skills Tag Manager */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-red-400" />
                  Technical Skills & Competencies
                </label>
                <div className="flex flex-wrap gap-2">
                  {editSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 flex items-center gap-1.5 font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={e => setNewSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                    placeholder="Add a skill (e.g. ROS 2, Embedded C, Gazebo, OpenCV)..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>

              {/* Social URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">GitHub URL</label>
                  <input
                    type="url"
                    value={editGithub}
                    onChange={e => setEditGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">LinkedIn URL</label>
                  <input
                    type="url"
                    value={editLinkedin}
                    onChange={e => setEditLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Portfolio / Website</label>
                  <input
                    type="url"
                    value={editPortfolio}
                    onChange={e => setEditPortfolio(e.target.value)}
                    placeholder="https://yourportfolio.dev"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Password update optional */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  Change Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-xs font-bold text-white shadow-xl shadow-red-950/60 flex items-center gap-2 cursor-pointer transition-all"
                  id="save-profile-btn"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save All Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-red-950 text-red-400 border border-red-800/80 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Overview & Skills</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'projects'
                ? 'bg-red-950 text-red-400 border border-red-800/80 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Projects & Hardware ({userProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'events'
                ? 'bg-red-950 text-red-400 border border-red-800/80 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Workshops & Competitions</span>
          </button>

          <button
            onClick={() => setActiveTab('idcard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'idcard'
                ? 'bg-red-950 text-red-400 border border-red-800/80 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <IdCard className="w-4 h-4" />
            <span>Digital Lab ID Card</span>
          </button>
        </div>

        {/* Tab 1: Overview & Skills */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Skills & Specialization */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-red-500" />
                  Technical Competencies & Skills
                </h3>
                {profileUser.skills && profileUser.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {profileUser.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 hover:border-red-500/50 transition-colors shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No skills listed yet. Click "Edit Profile" to add your skills.</p>
                )}
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Engineering Bio & Research Focus
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {profileUser.bio || 'This member is an active participant in e-Yantra LNJPIT robotics workshops and project development sessions.'}
                </p>
              </div>
            </div>

            {/* Right Col: Badges & Member Stats */}
            <div className="space-y-6">
              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-red-400" />
                  e-Yantra Verified Badges
                </h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-950 text-red-400 border border-red-800/50">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Verified Lab Member</p>
                      <p className="text-[10px] text-slate-400">LNJPIT Chapra e-Yantra Lab</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-sky-950 text-sky-400 border border-sky-800/50">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{profileUser.domain || 'Robotics & Automation'}</p>
                      <p className="text-[10px] text-slate-400">Primary Specialization</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/50">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Joined Community</p>
                      <p className="text-[10px] text-slate-400">{profileUser.joinedDate || '2026 Season'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Associated Projects & Prototypes</h3>
              <button
                onClick={() => navigate('/projects')}
                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
              >
                <span>Browse All Lab Projects</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {userProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.slug}`)}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-red-500/50 transition-all cursor-pointer group shadow-xl"
                  >
                    <div className="relative h-44 rounded-2xl overflow-hidden mb-4 bg-slate-950">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-red-400 border border-red-900/40">
                        {project.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-base group-hover:text-red-400 transition-colors">
                      {project.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.tags.slice(0, 3).map((t, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
                <Layers className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">No Projects Linked Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Projects that list {profileUser.name} as a team member or mentor will automatically appear here.
                </p>
                <button
                  onClick={() => navigate('/projects')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
                >
                  Explore Robotics Projects
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Events */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Upcoming Events & Bootcamps</h3>
              <button
                onClick={() => navigate('/events')}
                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
              >
                <span>View Event Calendar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.slice(0, 4).map(event => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/events/${event.slug}`)}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-red-500/50 transition-all cursor-pointer group shadow-xl flex gap-4 items-start"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-24 h-24 rounded-2xl object-cover bg-slate-950 shrink-0"
                  />
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/40 uppercase">
                      {event.category}
                    </span>
                    <h4 className="font-bold text-white text-sm group-hover:text-red-400 transition-colors">
                      {event.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-red-400" />
                      {event.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Digital ID Card */}
        {activeTab === 'idcard' && (
          <div className="max-w-md mx-auto py-4">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/40 border-2 border-red-500/50 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-36 h-36 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white text-xs">
                    eY
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-white">e-Yantra LNJPIT</p>
                    <p className="text-[9px] text-slate-400">Robotics & Innovation Lab</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-900/50">
                  {profileUser.role || 'MEMBER'}
                </span>
              </div>

              {/* Card Body */}
              <div className="flex items-center gap-4">
                <img
                  src={profileUser.avatar || PRESET_AVATARS[0]}
                  alt={profileUser.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-red-500 bg-slate-950 shrink-0"
                />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-base leading-tight">{profileUser.name}</h4>
                  <p className="text-xs text-red-400 font-mono">@{profileUser.username || profileUser.email?.split('@')[0]}</p>
                  <p className="text-[11px] text-slate-300">{profileUser.department}</p>
                  <p className="text-[10px] text-slate-400">{profileUser.year} • Roll: {profileUser.studentId || 'N/A'}</p>
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px]">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-mono">Domain</p>
                  <p className="font-semibold text-slate-200">{profileUser.domain || 'Robotics'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-500 uppercase font-mono">Valid ID</p>
                  <p className="font-mono text-emerald-400 font-bold">2026-ACTIVE</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
