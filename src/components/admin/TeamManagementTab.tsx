import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Plus, Search, Edit3, Trash2, CheckCircle, XCircle, 
  Upload, Sparkles, RefreshCw, Mail, Phone, Linkedin, Github, 
  Globe, BookOpen, Award, Check, AlertCircle, Eye, Star,
  ShieldCheck, ArrowUpDown, X, ExternalLink, GraduationCap, Image as ImageIcon
} from 'lucide-react';
import { TeamMember, TeamMemberType } from '../../types';
import { safeFetchJson, safeParseResponse } from '../../utils/api';

interface TeamManagementTabProps {
  onRefresh?: () => void;
  navigate?: (path: string) => void;
  initialRoleFilter?: string;
}

const MEMBER_TYPE_LABELS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  FACULTY: { label: 'Club_Head', bg: 'bg-red-950/60', text: 'text-red-400', border: 'border-red-800/60' },
  TECHNICAL_LEAD: { label: 'Technical Lead', bg: 'bg-sky-950/60', text: 'text-sky-400', border: 'border-sky-800/60' },
  COORDINATOR: { label: 'Student Coordinator', bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-800/60' },
  PROJECT_LEAD: { label: 'Project Lead', bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/60' },
  MEMBER: { label: 'Team Member', bg: 'bg-purple-950/60', text: 'text-purple-400', border: 'border-purple-800/60' },
  LAB_ASSISTANT: { label: 'Lab Assistant', bg: 'bg-cyan-950/60', text: 'text-cyan-400', border: 'border-cyan-800/60' },
  ALUMNI: { label: 'Alumni / Advisor', bg: 'bg-blue-950/60', text: 'text-blue-400', border: 'border-blue-800/60' },
  ADVISOR: { label: 'Advisor', bg: 'bg-indigo-950/60', text: 'text-indigo-400', border: 'border-indigo-800/60' },
  OTHER: { label: 'Special Member', bg: 'bg-slate-800/60', text: 'text-slate-300', border: 'border-slate-700' },
};

export const TeamManagementTab: React.FC<TeamManagementTabProps> = ({ onRefresh, navigate, initialRoleFilter }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>(initialRoleFilter || 'ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'all' | 'basic' | 'photo' | 'social' | 'settings'>('all');

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [memberType, setMemberType] = useState<TeamMemberType>('TECHNICAL_LEAD');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Electronics & Communication Engineering');
  const [batch, setBatch] = useState('3rd Year (Batch 2023-27)');
  const [college, setCollege] = useState('Lok Nayak Jai Prakash Institute of Technology (LNJPIT), Chapra');
  const [shortBio, setShortBio] = useState('');
  const [fullBiography, setFullBiography] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [areasInput, setAreasInput] = useState('');
  const [projectsInput, setProjectsInput] = useState('');
  const [achievementsInput, setAchievementsInput] = useState('');
  const [responsibilitiesInput, setResponsibilitiesInput] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [visibility, setVisibility] = useState('PUBLIC');

  // Social Links Form State
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [website, setWebsite] = useState('');
  const [googleScholar, setGoogleScholar] = useState('');
  const [researchGate, setResearchGate] = useState('');
  const [otherLink, setOtherLink] = useState('');

  // Photo Upload State
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status message
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getAdminToken = () => {
    return localStorage.getItem('eyantra_jwt_token') || localStorage.getItem('eyantra_token') || '';
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await safeFetchJson('/api/team-members?activeOnly=false', {
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      if (Array.isArray(data)) {
        setMembers(data);
      }
    } catch (e) {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openCreateModal = (defaultRole?: TeamMemberType) => {
    setModalMode('create');
    setEditingId(null);
    setModalTab('all');
    setName('');
    setSlug('');
    
    // Choose role based on filter or argument or default to FACULTY
    let initialRole: TeamMemberType = 'FACULTY';
    if (defaultRole) {
      initialRole = defaultRole;
    } else if (typeFilter && typeFilter !== 'ALL') {
      initialRole = typeFilter as TeamMemberType;
    }
    setMemberType(initialRole);
    setDesignation(initialRole === 'FACULTY' ? ' Club_Head' : initialRole === 'TECHNICAL_LEAD' ? 'Technical Lead' : initialRole === 'COORDINATOR' ? 'Student Coordinator' : '');
    setDepartment('Electronics & Communication Engineering');
    setBatch(initialRole === 'FACULTY' ? 'Faculty Mentor / Advisor' : '3rd Year (Batch 2023-27)');
    setCollege('Lok Nayak Jai Prakash Institute of Technology (LNJPIT), Chapra');
    setShortBio('');
    setFullBiography('');
    setSkillsInput('');
    setAreasInput('');
    setProjectsInput('');
    setAchievementsInput('');
    setResponsibilitiesInput('');
    setEmail('');
    setPhone('');
    setOrder(members.length + 1);
    setIsActive(true);
    setIsFeatured(false);
    setIsPublished(true);
    setVisibility('PUBLIC');
    setLinkedin('');
    setGithub('');
    setPortfolio('');
    setWebsite('');
    setGoogleScholar('');
    setResearchGate('');
    setOtherLink('');
    setPhotoUrl('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400');
    setPhotoBase64(null);
    setPhotoPreview(null);
    setPhotoFileName('');
    setPhotoError(null);
    setStatusMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (m: TeamMember) => {
    setModalMode('edit');
    setEditingId(m.id);
    setModalTab('all');
    setName(m.name);
    setSlug(m.slug);
    setMemberType((m.memberType || 'MEMBER').toUpperCase() as TeamMemberType);
    setDesignation(m.designation);
    setDepartment(m.department);
    setBatch(m.batch || 'Batch 2023-27');
    setCollege(m.college || 'Lok Nayak Jai Prakash Institute of Technology (LNJPIT), Chapra');
    setShortBio(m.shortBio || '');
    setFullBiography(m.fullBiography || m.shortBio || '');
    setSkillsInput((m.skills || []).join(', '));
    setAreasInput((m.areasOfInterest || []).join(', '));
    setProjectsInput((m.projects || []).join(', '));
    setAchievementsInput((m.achievements || []).join(', '));
    setResponsibilitiesInput((m.responsibilities || []).join(', '));
    setEmail(m.email);
    setPhone(m.phone || '');
    setOrder(m.order ?? 1);
    setIsActive(m.isActive ?? true);
    setIsFeatured(m.isFeatured ?? false);
    setIsPublished(m.isPublished ?? true);
    setVisibility(m.visibility || 'PUBLIC');
    setLinkedin(m.socialLinks?.linkedin || '');
    setGithub(m.socialLinks?.github || '');
    setPortfolio(m.socialLinks?.portfolio || '');
    setWebsite(m.socialLinks?.website || '');
    setGoogleScholar(m.socialLinks?.googleScholar || '');
    setResearchGate(m.socialLinks?.researchGate || '');
    setOtherLink(m.socialLinks?.other || '');
    setPhotoUrl(m.photo);
    setPhotoBase64(null);
    setPhotoPreview(m.photo);
    setPhotoFileName('');
    setPhotoError(null);
    setStatusMsg(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      const err = 'Invalid file format. Please select a JPG, JPEG, PNG, or WebP photo.';
      setPhotoError(err);
      setStatusMsg({ type: 'error', text: err });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const err = 'File size exceeds 5MB limit. Please upload an image under 5MB.';
      setPhotoError(err);
      setStatusMsg({ type: 'error', text: err });
      return;
    }

    setPhotoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoBase64(result);
      setPhotoPreview(result);
      setPhotoError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoBase64(null);
    setPhotoFileName('');
    setPhotoPreview(null);
    setPhotoUrl('');
    setPhotoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAutoGenerateSlug = () => {
    if (!name) return;
    const generated = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setSlug(generated);
  };

  const cleanUrl = (urlStr: string): string => {
    const trimmed = (urlStr || '').trim();
    if (!trimmed) return '';
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!name.trim()) {
      setStatusMsg({ type: 'error', text: 'Full Name is required' });
      return;
    }
    if (!designation.trim()) {
      setStatusMsg({ type: 'error', text: 'Designation / Role Title is required' });
      return;
    }
    if (!department.trim()) {
      setStatusMsg({ type: 'error', text: 'Department is required' });
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid official email address' });
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        memberType,
        designation: designation.trim(),
        department: department.trim(),
        batch: batch.trim(),
        college: college.trim(),
        shortBio: shortBio.trim(),
        fullBiography: fullBiography.trim() || shortBio.trim(),
        skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
        areasOfInterest: areasInput.split(',').map(a => a.trim()).filter(Boolean),
        projects: projectsInput.split(',').map(p => p.trim()).filter(Boolean),
        achievements: achievementsInput.split(',').map(a => a.trim()).filter(Boolean),
        responsibilities: responsibilitiesInput.split(',').map(r => r.trim()).filter(Boolean),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        order: Number(order) || 1,
        isActive,
        isFeatured,
        isPublished,
        visibility,
        socialLinks: {
          linkedin: cleanUrl(linkedin),
          github: cleanUrl(github),
          portfolio: cleanUrl(portfolio),
          website: cleanUrl(website),
          googleScholar: cleanUrl(googleScholar),
          researchGate: cleanUrl(researchGate),
          other: cleanUrl(otherLink)
        }
      };

      if (photoBase64) {
        payload.imageBase64 = photoBase64;
        payload.photoFilename = photoFileName || name;
      } else if (photoUrl) {
        payload.photo = photoUrl;
      }

      const url = modalMode === 'create' ? '/api/team-members' : `/api/team-members/${editingId}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify(payload)
      });

      const { data: errData, error: parseErr } = await safeParseResponse(res);
      if (!res.ok) {
        throw new Error(errData?.error || parseErr || 'Failed to save team member profile to database');
      }

      setIsModalOpen(false);
      fetchMembers();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error occurred while saving profile to database' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (m: TeamMember) => {
    try {
      const updatedStatus = !m.isActive;
      setMembers(prev => prev.map(item => item.id === m.id ? { ...item, isActive: updatedStatus } : item));

      const res = await fetch(`/api/team-members/${m.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({ isActive: updatedStatus })
      });

      if (!res.ok) {
        setMembers(prev => prev.map(item => item.id === m.id ? { ...item, isActive: m.isActive } : item));
        alert('Failed to update status');
      } else {
        if (onRefresh) onRefresh();
      }
    } catch (e) {
      console.error('Failed to toggle status', e);
      fetchMembers();
    }
  };

  const handleDeleteMember = async (m: TeamMember) => {
    if (!confirm(`Are you sure you want to permanently delete the profile of "${m.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/team-members/${m.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });

      if (res.ok) {
        setMembers(prev => prev.filter(item => item.id !== m.id));
        if (onRefresh) onRefresh();
      } else {
        const { data } = await safeParseResponse(res);
        alert(data?.error || 'Failed to delete member');
      }
    } catch (e) {
      alert('Error occurred while deleting member');
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.skills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || (m.memberType || '').toUpperCase() === typeFilter;
    const matchesStatus = 
      statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && m.isActive) || 
      (statusFilter === 'INACTIVE' && !m.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalCount = members.length;
  const facultyCount = members.filter(m => m.memberType === 'FACULTY').length;
  const techLeadCount = members.filter(m => m.memberType === 'TECHNICAL_LEAD').length;
  const coordCount = members.filter(m => m.memberType === 'COORDINATOR').length;
  const projectLeadCount = members.filter(m => m.memberType === 'PROJECT_LEAD').length;
  const activeCount = members.filter(m => m.isActive).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Team Member Profile Management System</h3>
              <p className="text-xs text-slate-400">Manage verified faculty mentors, technical leads, student coordinators, and project leads.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMembers}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1.5 transition-colors"
              title="Refresh Members"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Team Member</span>
            </button>
          </div>
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mt-5 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Total Members</span>
            <span className="text-xl font-black text-white mt-0.5 block">{totalCount}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-red-400 block text-[11px]">Faculty Mentors</span>
            <span className="text-xl font-black text-red-400 mt-0.5 block">{facultyCount}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-sky-400 block text-[11px]">Technical Leads</span>
            <span className="text-xl font-black text-sky-400 mt-0.5 block">{techLeadCount}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-amber-400 block text-[11px]">Coordinators</span>
            <span className="text-xl font-black text-amber-400 mt-0.5 block">{coordCount}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-emerald-400 block text-[11px]">Project Leads</span>
            <span className="text-xl font-black text-emerald-400 mt-0.5 block">{projectLeadCount}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Active Profiles</span>
            <span className="text-xl font-black text-white mt-0.5 block">{activeCount} / {totalCount}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, designation, department, skills, email..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Roles ({totalCount})</option>
            <option value="FACULTY">Club_Head ({facultyCount})</option>
            <option value="TECHNICAL_LEAD">Technical Leads ({techLeadCount})</option>
            <option value="COORDINATOR">Student Coordinators ({coordCount})</option>
            <option value="PROJECT_LEAD">Project Leads ({projectLeadCount})</option>
            <option value="MEMBER">Team Members</option>
            <option value="OTHER">Other Members</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-red-500" />
            <p className="text-xs">Loading team member records from MongoDB Atlas...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Users className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-white">No team members match the criteria.</p>
            <p className="text-xs text-slate-500">Try adjusting your search query or role filter, or create a new profile.</p>
            <button
              onClick={openCreateModal}
              className="mt-2 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
            >
              + Create First Team Member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Profile & Member</th>
                  <th className="py-3.5 px-4">Role & Category</th>
                  <th className="py-3.5 px-4">Department & Batch</th>
                  <th className="py-3.5 px-4">Social & Links</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMembers.map((m) => {
                  const badge = MEMBER_TYPE_LABELS[m.memberType?.toUpperCase()] || MEMBER_TYPE_LABELS.OTHER;
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={m.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                              alt={m.name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800"
                            />
                            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${
                              m.isActive ? 'bg-emerald-500' : 'bg-slate-500'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-sm">{m.name}</span>
                              {m.isFeatured && (
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" title="Featured Member" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">{m.email}</p>
                            <span className="text-[10px] text-slate-500 font-mono">/{m.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Category */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                        <p className="text-xs font-semibold text-slate-200 mt-1">{m.designation}</p>
                      </td>

                      {/* Department & Batch */}
                      <td className="py-3.5 px-4">
                        <p className="text-slate-300 font-medium">{m.department}</p>
                        <p className="text-[11px] text-slate-500">{m.batch || 'e-Yantra LNJPIT'}</p>
                      </td>

                      {/* Social Links */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          {m.socialLinks?.linkedin && (
                            <a
                              href={m.socialLinks.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-sky-400 transition-colors"
                              title="LinkedIn"
                            >
                              <Linkedin className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {m.socialLinks?.github && (
                            <a
                              href={m.socialLinks.github}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-white transition-colors"
                              title="GitHub"
                            >
                              <Github className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {m.socialLinks?.portfolio && (
                            <a
                              href={m.socialLinks.portfolio}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-emerald-400 transition-colors"
                              title="Portfolio"
                            >
                              <Globe className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {m.socialLinks?.googleScholar && (
                            <a
                              href={m.socialLinks.googleScholar}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-amber-400 transition-colors"
                              title="Google Scholar"
                            >
                              <GraduationCap className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {m.socialLinks?.researchGate && (
                            <a
                              href={m.socialLinks.researchGate}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-teal-400 transition-colors"
                              title="ResearchGate"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {m.email && (
                            <a
                              href={`mailto:${m.email}`}
                              className="hover:text-red-400 transition-colors"
                              title="Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(m)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                            m.isActive 
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/80' 
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${m.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                          {m.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              if (navigate) {
                                navigate(`/profile/${m.slug || m.id}`);
                              } else {
                                window.location.href = `/profile/${m.slug || m.id}`;
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                            title="View Public Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(m)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                            title="Edit Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(m)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-red-400 hover:bg-slate-800 transition-colors"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Profile Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 text-slate-100 shadow-2xl space-y-5 my-8 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-400 font-bold">
                  {modalMode === 'create' ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {modalMode === 'create'
                      ? (memberType === 'FACULTY' ? 'Add New Club_Head' : memberType === 'COORDINATOR' ? 'Add New Student Coordinator' : memberType === 'TECHNICAL_LEAD' ? 'Add New Technical Lead' : 'Add New Team Member')
                      : (memberType === 'FACULTY' ? `Edit Club_Head: ${name || 'Faculty'}` : `Edit Team Member: ${name || 'Member'}`)}
                  </h3>
                  <p className="text-xs text-slate-400">Add profile details, permanent photo, and social links.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {statusMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 shrink-0 ${
                statusMsg.type === 'error' ? 'bg-red-950/60 border border-red-800 text-red-300' : 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
              }`}>
                {statusMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* Quick View Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-2.5 text-xs font-semibold shrink-0">
              {[
                { id: 'all', label: 'All Form Fields' },
                { id: 'basic', label: 'Basic Info' },
                { id: 'photo', label: 'Profile Photo' },
                { id: 'social', label: 'Social / Academic' },
                { id: 'settings', label: 'Settings' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setModalTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    modalTab === tab.id
                      ? 'bg-red-600 text-white shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              {/* SECTION: BASIC CREDENTIALS */}
              {(modalTab === 'all' || modalTab === 'basic') && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (modalMode === 'create' && !slug) {
                            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                          }
                        }}
                        placeholder="e.g. Dr. A. K. Singh or Vikram Singh"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Role *</label>
                      <select
                        value={memberType}
                        onChange={(e) => setMemberType(e.target.value as TeamMemberType)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      >
                        <option value="FACULTY">Club_Head / Mentor</option>
                        <option value="TECHNICAL_LEAD">Technical Lead</option>
                        <option value="COORDINATOR">Student Coordinator</option>
                        <option value="PROJECT_LEAD">Project Lead</option>
                        <option value="MEMBER">Core Team Member</option>
                        <option value="LAB_ASSISTANT">Lab Assistant</option>
                        <option value="ALUMNI">Alumni / Advisor</option>
                        <option value="ADVISOR">Advisor</option>
                        <option value="OTHER">Other Special Member</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Designation *</label>
                      <input
                        type="text"
                        required
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Assistant Professor & Club_Head"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Department *</label>
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Electronics & Communication Engineering"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Batch / Academic Year</label>
                      <input
                        type="text"
                        value={batch}
                        onChange={(e) => setBatch(e.target.value)}
                        placeholder={memberType === 'FACULTY' ? 'e.g. Faculty Mentor / Advisor' : 'e.g. 3rd Year (Batch 2023-27)'}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. faculty@lnjpit.ac.in"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Phone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">College / Institution</label>
                      <input
                        type="text"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="Lok Nayak Jai Prakash Institute of Technology (LNJPIT), Chapra"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: PROFILE PHOTO UPLOAD */}
              {(modalTab === 'all' || modalTab === 'photo') && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-white text-xs flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-red-500" />
                      <span>Profile Photo</span>
                    </label>
                    <span className="text-[11px] text-slate-400">JPG, JPEG, PNG, WEBP • Max 5MB</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                    {/* Instant Photo Preview (Square Headshot) */}
                    <div className="relative group shrink-0">
                      <img
                        src={photoPreview || photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300'}
                        alt="Profile Photo Preview"
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-2 ring-slate-700 shadow-xl bg-slate-900"
                      />
                      <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[10px] text-slate-400 font-mono">
                        Square Preview
                      </span>
                    </div>

                    {/* Upload / Replace / Remove Buttons */}
                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                      />

                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{photoBase64 || photoUrl ? 'Replace Photo' : 'Choose Photo'}</span>
                        </button>

                        {(photoBase64 || photoUrl) && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs transition-colors"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 space-y-0.5">
                        <p>Recommended: Square photo, professional headshot.</p>
                        {photoFileName && (
                          <p className="text-emerald-400 font-mono font-semibold">
                            ✓ Ready to save: {photoFileName}
                          </p>
                        )}
                        {photoError && (
                          <p className="text-red-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{photoError}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: BIO & PROFILE CONTENT */}
              {(modalTab === 'all' || modalTab === 'basic') && (
                <div className="space-y-3.5">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Bio</label>
                    <textarea
                      rows={3}
                      value={shortBio}
                      onChange={(e) => setShortBio(e.target.value)}
                      placeholder="Brief summary of coordinator responsibilities, research background, and guidance in e-Yantra LNJPIT."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* SECTION: SOCIAL / ACADEMIC LINKS */}
              {(modalTab === 'all' || modalTab === 'social') && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Social & Professional Profiles</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                        <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                        <span>LinkedIn</span>
                      </label>
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                        <Github className="w-3.5 h-3.5" />
                        <span>GitHub</span>
                      </label>
                      <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Portfolio / Website</span>
                      </label>
                      <input
                        type="text"
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Google Scholar</span>
                      </label>
                      <input
                        type="text"
                        value={googleScholar}
                        onChange={(e) => setGoogleScholar(e.target.value)}
                        placeholder="https://scholar.google.com/..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                      <span>ResearchGate</span>
                    </label>
                    <input
                      type="text"
                      value={researchGate}
                      onChange={(e) => setResearchGate(e.target.value)}
                      placeholder="https://researchgate.net/profile/..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* SECTION: EXPERTISE & SKILLS */}
              {(modalTab === 'all' || modalTab === 'basic') && (
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Areas of Expertise</label>
                    <input
                      type="text"
                      value={areasInput}
                      onChange={(e) => setAreasInput(e.target.value)}
                      placeholder="e.g. Embedded Systems, Robotics, IoT, Power Electronics"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Skills</label>
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      placeholder="e.g. ROS 2, MATLAB, Python, PCB Design, Microcontrollers"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {/* SECTION: ADVANCED SETTINGS & VISIBILITY */}
              {(modalTab === 'all' || modalTab === 'settings') && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                  <h4 className="font-bold text-white text-xs">Display & Publication Controls</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-300 block">Profile URL Slug</label>
                        <button
                          type="button"
                          onClick={handleAutoGenerateSlug}
                          className="text-[10px] text-red-400 hover:underline"
                        >
                          Auto-generate
                        </button>
                      </div>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="e.g. dr-a-k-singh"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Display Sort Order</label>
                      <input
                        type="number"
                        min="1"
                        value={order}
                        onChange={(e) => setOrder(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded border-slate-700 text-red-600 focus:ring-red-500 w-4 h-4"
                      />
                      <span className="font-semibold text-white">Active Profile</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="rounded border-slate-700 text-red-600 focus:ring-red-500 w-4 h-4"
                      />
                      <span className="font-semibold text-white">Featured Member</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="rounded border-slate-700 text-red-600 focus:ring-red-500 w-4 h-4"
                      />
                      <span className="font-semibold text-white">Published</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Form Footer Buttons */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-950/40 disabled:opacity-50 transition-all"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {modalMode === 'create'
                          ? (memberType === 'FACULTY' ? 'Save Faculty' : 'Save Member')
                          : 'Save Changes'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagementTab;
