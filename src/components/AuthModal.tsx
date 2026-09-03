import React, { useState } from 'react';
import {
  X,
  LogIn,
  ShieldCheck,
  User,
  UserPlus,
  Lock,
  Mail,
  GraduationCap,
  Sparkles,
  Eye,
  EyeOff,
  Camera,
  AtSign,
  Phone,
  BookOpen
} from 'lucide-react';
import { User as UserType } from '../types';
import { safeParseResponse } from '../utils/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, user: UserType) => void;
  initialMode?: 'login' | 'register';
  isFirstVisit?: boolean;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  isFirstVisit = false
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState(''); // email or username for login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Electronics & Communication Engineering');
  const [year, setYear] = useState('1st Year');
  const [studentId, setStudentId] = useState('');
  const [domain, setDomain] = useState('Robotics & Automation');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('Robotics, C/C++, Microcontrollers');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [adminKey, setAdminKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (authMode === 'register') {
        if (!name.trim() || !email.trim()) {
          throw new Error('Please provide your full name and college email.');
        }
        if (!password || password.length < 4) {
          throw new Error('Password must be at least 4 characters long.');
        }

        const selectedAvatar = customAvatarUrl.trim() || avatar;
        const autoUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            username: autoUsername,
            email: email.trim().toLowerCase(),
            password,
            phone: phone.trim(),
            department,
            year,
            studentId: studentId.trim(),
            domain,
            bio: bio.trim() || `e-Yantra LNJPIT member passionate about ${domain}.`,
            skills: skills.split(',').map(s => s.trim()).filter(Boolean),
            avatar: selectedAvatar,
            role: adminKey === 'admin123' || adminKey === 'EYANTRA_ADMIN_2026' ? 'ADMIN' : 'MEMBER',
            adminKey
          })
        });

        const { data, error: parseErr } = await safeParseResponse(res);
        if (!res.ok || parseErr || !data) throw new Error(data?.error || parseErr || 'Registration failed. Please check inputs.');

        onLoginSuccess(data.token, data.user);
        onClose();
      } else {
        // Sign In Flow
        const loginKey = identifier.trim() || email.trim();
        if (!loginKey) {
          throw new Error('Please enter your username or email address.');
        }
        if (!password) {
          throw new Error('Please enter your password.');
        }

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: loginKey,
            password
          })
        });

        const { data, error: parseErr } = await safeParseResponse(res);
        if (!res.ok || parseErr || !data) throw new Error(data?.error || parseErr || 'Login failed. Please check your credentials.');

        onLoginSuccess(data.token, data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (userKey: 'admin' | 'student' | 'faculty') => {
    setAuthMode('login');
    setError('');
    if (userKey === 'admin') {
      setIdentifier('admin');
      setPassword('admin');
    } else if (userKey === 'faculty') {
      setIdentifier('rksharma');
      setPassword('faculty123');
    } else {
      setIdentifier('aarav');
      setPassword('student123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 text-slate-100 relative my-8 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Welcome Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            {authMode === 'register' ? <Sparkles className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {authMode === 'register' ? 'Create e-Yantra Account' : 'Welcome Back'}
              {isFirstVisit && authMode === 'register' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold">
                  First Time Visitor
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              {authMode === 'register'
                ? 'Join LNJPIT’s premier robotics & engineering community'
                : 'Sign in with your username or email to access your portal'}
            </p>
          </div>
        </div>

        {/* First Time Visitor Notice */}
        {isFirstVisit && authMode === 'register' && (
          <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border border-red-900/40 text-xs text-slate-300 flex items-start gap-3">
            <GraduationCap className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">First time visiting e-Yantra LNJPIT?</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Register your profile to submit hardware projects, register for robotics bootcamps, and build your digital engineering portfolio in our database.
              </p>
            </div>
          </div>
        )}

        {/* Mode Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setError(''); }}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              authMode === 'login'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('register'); setError(''); }}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              authMode === 'register'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/90 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ================= REGISTER FIELDS ================= */}
          {authMode === 'register' && (
            <>
              {/* Photo & Preset Picker */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-red-400" />
                  Choose Profile Photo / Avatar
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={customAvatarUrl.trim() || avatar}
                    alt="Selected Avatar"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-red-500/60 bg-slate-900 shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { setAvatar(av); setCustomAvatarUrl(''); }}
                          className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition-all ${
                            avatar === av && !customAvatarUrl ? 'border-red-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={av} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <input
                      type="url"
                      value={customAvatarUrl}
                      onChange={e => setCustomAvatarUrl(e.target.value)}
                      placeholder="Or paste custom image URL..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => {
                        setName(e.target.value);
                        if (!username) {
                          setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''));
                        }
                      }}
                      placeholder="e.g. Vikramaditya"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username / Handle <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="e.g. vikram_robotics"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. student@lnjpit.ac.in"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Department, Year & Student ID */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Branch</label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Electronics & Communication Engineering">ECE</option>
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Electrical & Electronics Engineering">EEE</option>
                    <option value="Mechanical Engineering">ME</option>
                    <option value="Civil Engineering">CE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Year</label>
                  <select
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Faculty / Mentor">Faculty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Roll / ID</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    placeholder="2310401"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Domain & Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Domain Interest</label>
                  <select
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Robotics & Automation">Robotics & Automation</option>
                    <option value="Embedded Systems & IoT">Embedded Systems & IoT</option>
                    <option value="ROS 2 & Autonomous Systems">ROS 2 & Navigation</option>
                    <option value="Drone & UAV Technology">Drone & UAV</option>
                    <option value="Edge AI & Computer Vision">Edge AI & Vision</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Technical Skills</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                    placeholder="e.g. ROS 2, Python, C++, Arduino"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Create Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ================= LOGIN FIELDS ================= */}
          {authMode === 'login' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username or Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="e.g. admin or student.lead@lnjpit.ac.in"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password <span className="text-red-400">*</span>
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl font-bold text-xs text-white shadow-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition-all shadow-red-950/60 flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : authMode === 'register' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account in Database</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Account</span>
              </>
            )}
          </button>
        </form>

        {/* Demo One-Click Fill Helper */}
        <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Test / Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-red-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </div>
              <p className="text-[9px] text-slate-500 truncate">admin / admin</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('faculty')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-rose-400">
                <BookOpen className="w-3.5 h-3.5" />
                Faculty
              </div>
              <p className="text-[9px] text-slate-500 truncate">rksharma / faculty123</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-sky-400">
                <User className="w-3.5 h-3.5" />
                Student
              </div>
              <p className="text-[9px] text-slate-500 truncate">aarav / student123</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
