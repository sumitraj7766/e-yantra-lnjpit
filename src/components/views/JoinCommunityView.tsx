import React, { useState } from 'react';
import { Rocket, CheckCircle2, Sparkles, Send, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface JoinCommunityViewProps {
  navigate: (path: string) => void;
}

export const JoinCommunityView: React.FC<JoinCommunityViewProps> = ({ navigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Electronics & Communication Engineering');
  const [year, setYear] = useState('2nd Year (2024-2028)');
  const [skills, setSkills] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>(['Robotics']);
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [whyJoin, setWhyJoin] = useState('');
  const [previousProjects, setPreviousProjects] = useState('');
  const [experience, setExperience] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const availableDomains = [
    'Robotics & Kinematics',
    'AI / Machine Learning',
    'IoT & Wireless Sensor Grids',
    'Embedded Systems & Firmware',
    'Programming & Fullstack',
    'Electronics & Circuit Design',
    'Mechanical CAD & Prototyping',
    'UI/UX Design',
    'Media, PR & Documentation',
    'Event Management'
  ];

  const handleDomainToggle = (domain: string) => {
    setSelectedDomains(prev => 
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !whyJoin) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName, email, phone, department, year,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          domains: selectedDomains,
          github, linkedin, portfolio, whyJoin, previousProjects, experience, resumeUrl
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit join application');

      setSubmitted(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-slate-100">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Community Application</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Join e-Yantra LNJPIT</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Be a part of LNJPIT's flagship robotics and technology community. Build real hardware, compete nationally, and accelerate your engineering career.
        </p>
      </div>

      {submitted ? (
        <div className="bg-slate-900 border border-emerald-800/80 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white">Application Submitted Successfully!</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Thank you, <span className="font-bold text-white">{fullName}</span>. Your application for e-Yantra LNJPIT has been logged in our database. Our student coordinators and faculty review committee will update your status shortly.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs"
            >
              Go to Member Portal
            </button>
            <button
              onClick={() => { setSubmitted(false); setFullName(''); }}
              className="px-5 py-2.5 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 text-xs"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-6 text-xs">
          
          {error && (
            <p className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl">{error}</p>
          )}

          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              1. Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Prakash"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. rahul@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 91234 56789"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Department *</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                >
                  <option value="Electronics & Communication Engineering">Electronics & Communication (ECE)</option>
                  <option value="Computer Science & Engineering">Computer Science (CSE)</option>
                  <option value="Electrical Engineering">Electrical Engg.</option>
                  <option value="Mechanical Engineering">Mechanical Engg.</option>
                  <option value="Civil Engineering">Civil Engg.</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Year of Study *</label>
                <select
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                >
                  <option value="1st Year (2025-2029)">1st Year</option>
                  <option value="2nd Year (2024-2028)">2nd Year</option>
                  <option value="3rd Year (2023-2027)">3rd Year</option>
                  <option value="4th Year (2022-2026)">4th Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Domain Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              2. Technical Domains & Interests
            </h3>
            <p className="text-slate-400">Select the domains you want to learn or contribute to:</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableDomains.map(d => {
                const isSelected = selectedDomains.includes(d);
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => handleDomainToggle(d)}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-red-950 border-red-700 text-red-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{d}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Experience & Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              3. Experience & Motivation
            </h3>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Why do you want to join e-Yantra LNJPIT? *</label>
              <textarea
                rows={3}
                value={whyJoin}
                onChange={e => setWhyJoin(e.target.value)}
                placeholder="Explain what motivates you to build projects and collaborate with our technical community..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Technical Skills (comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  placeholder="e.g. C++, Python, Arduino, ROS 2, Git"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">GitHub Profile Link</label>
                <input
                  type="url"
                  value={github}
                  onChange={e => setGithub(e.target.value)}
                  placeholder="https://github.com/yourusername"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 font-extrabold text-sm text-white rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Logging Application...' : 'Submit Join Application'}
          </button>

        </form>
      )}

    </div>
  );
};
