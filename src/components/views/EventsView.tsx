import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, CheckCircle2, X, ArrowLeft, Sparkles, LogIn, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { EventItem, User } from '../../types';

interface EventsViewProps {
  events?: EventItem[];
  navigate: (path: string) => void;
  selectedSlug?: string;
  currentUser?: User | null;
  onRequireAuth?: () => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events = [],
  navigate,
  selectedSlug,
  currentUser,
  onRequireAuth
}) => {
  const [registeringEvent, setRegisteringEvent] = useState<EventItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('ECE');
  const [year, setYear] = useState('3rd Year');
  const [studentId, setStudentId] = useState('');
  const [skills, setSkills] = useState('');
  const [teamPreference, setTeamPreference] = useState('Individual');

  // Pre-fill user data if logged in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setName(currentUser.name);
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.department) setDepartment(currentUser.department);
      if (currentUser.year) setYear(currentUser.year);
      if (currentUser.studentId) setStudentId(currentUser.studentId);
    }
  }, [currentUser, registeringEvent]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const currentEvent = selectedSlug 
    ? (events || []).find(e => e.slug === selectedSlug || e.id === selectedSlug)
    : null;

  const handleRegisterClick = (event: EventItem) => {
    const token = localStorage.getItem('eyantra_jwt_token') || localStorage.getItem('eyantra_token');
    if (!token && onRequireAuth) {
      onRequireAuth();
      return;
    }
    setRegisteringEvent(event);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringEvent) return;

    const token = localStorage.getItem('eyantra_jwt_token') || localStorage.getItem('eyantra_token');
    if (!token) {
      setError('Please log in or create an account to complete event registration.');
      if (onRequireAuth) onRequireAuth();
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const res = await fetch(`/api/events/${registeringEvent.id}/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fullName: name || currentUser?.name,
          name: name || currentUser?.name,
          email: email || currentUser?.email,
          phone: phone || currentUser?.phone,
          college: 'LNJPIT Chapra',
          department: department || currentUser?.department || 'ECE',
          branch: department || currentUser?.department || 'ECE',
          year: year || currentUser?.year || '3rd Year',
          rollNumber: studentId || currentUser?.studentId,
          rollNo: studentId || currentUser?.studentId,
          skills,
          teamPreference
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          if (onRequireAuth) onRequireAuth();
          throw new Error('Authentication required. Please sign in to register.');
        }
        throw new Error(data.error || 'Registration failed');
      }

      const regIdMsg = data.registration?.registrationId ? ` (ID: ${data.registration.registrationId})` : (data.registrationId ? ` (ID: ${data.registrationId})` : '');
      const statusMsg = (data.registration?.status === 'WAITLISTED' || data.status === 'WAITLISTED') ? 'Added to Event Waitlist!' : 'Registration Confirmed!';
      setSuccessMsg(`${statusMsg} for ${registeringEvent.title}${regIdMsg}`);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {
        setRegisteringEvent(null);
        setSuccessMsg('');
      }, 4000);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // DETAIL VIEW
  if (currentEvent) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-100">
        <button
          onClick={() => navigate('/events')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 sm:p-10 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="text-xs font-bold uppercase px-3 py-1 rounded bg-red-950 text-red-400 border border-red-800/50">
              {currentEvent.category}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-950 text-slate-300">
              {currentEvent.status}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">{currentEvent.title}</h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500 shrink-0" />
              <div>
                <p className="font-bold text-white">{currentEvent.date}</p>
                <p className="text-[11px] text-slate-500">{currentEvent.startTime} - {currentEvent.endTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <div>
                <p className="font-bold text-white">Venue</p>
                <p className="text-[11px] text-slate-500">{currentEvent.venue}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-red-500 shrink-0" />
              <div>
                <p className="font-bold text-white">Registrations</p>
                <p className="text-[11px] text-slate-500">{currentEvent.registeredCount} / {currentEvent.capacity} Participants</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h2 className="text-lg font-bold text-white">Event Details</h2>
            <p>{currentEvent.fullDetails || currentEvent.description}</p>
          </div>

          {(currentEvent.status === 'Registration Open' || currentEvent.status === 'Upcoming') && (
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => handleRegisterClick(currentEvent)}
                className="w-full py-3 bg-red-600 hover:bg-red-500 font-bold text-sm text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {!currentUser && <Lock className="w-4 h-4" />}
                {currentUser ? 'Register for Event Now' : 'Sign In to Register'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // MAIN LIST VIEW
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-slate-100">
      
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">e-Yantra Events</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Workshops, Hackathons & Bootcamps</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Participate in state robotics hackathons, hands-on ESP32 firmware training, and ROS 2 navigation bootcamps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(events || []).map(evt => (
          <div key={evt.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-bold text-red-400 uppercase tracking-wider">{evt.category}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  evt.status === 'Registration Open' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-slate-950 text-slate-400'
                }`}>
                  {evt.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{evt.title}</h3>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">{evt.description}</p>

              <div className="space-y-2 text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-red-500" />
                  <span>{evt.date} • {evt.startTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span className="truncate">{evt.venue}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">{evt.registeredCount} Registered</span>
              <button
                onClick={() => handleRegisterClick(evt)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-semibold text-white transition-colors flex items-center gap-1.5"
              >
                {!currentUser && <Lock className="w-3.5 h-3.5" />}
                {currentUser ? 'Register' : 'Sign in to Register'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* REGISTRATION MODAL */}
      {registeringEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 relative text-slate-100">
            <button
              onClick={() => setRegisteringEvent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">Event Registration</h3>
              <p className="text-xs text-red-400 font-medium">{registeringEvent.title}</p>
            </div>

            {error && (
              <p className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-lg">{error}</p>
            )}

            {successMsg && (
              <p className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-lg font-bold text-center">
                {successMsg}
              </p>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Saurabh Kumar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@lnjpit.ac.in"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="ECE">ECE</option>
                    <option value="CSE">CSE</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Year</label>
                  <select
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 font-bold text-white rounded-lg transition-all"
              >
                {loading ? 'Submitting...' : 'Confirm Registration'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
