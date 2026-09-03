import React, { useState } from 'react';
import { 
  Bot, Search, User, Menu, X, Cpu, LogIn, ChevronDown, 
  ShieldCheck, LayoutDashboard, Sparkles, BookOpen, Layers, GraduationCap
} from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  user: UserType | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAI: () => void;
  onOpenSearch: () => void;
  noticeBanner?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  navigate,
  user,
  onOpenAuth,
  onLogout,
  onOpenAI,
  onOpenSearch,
  noticeBanner
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { 
      name: 'Team', 
      path: '/team',
      hasDropdown: true,
      subItems: [
        { name: 'All Team Members', path: '/team' },
        { name: 'Faculty Coordinators', path: '/team/faculty' },
        { name: 'Student Leadership', path: '/team/coordinators' },
        { name: 'Technical Leads', path: '/team/technical-leads' },
        { name: 'Alumni Network', path: '/team/alumni' },
      ]
    },
    { name: 'Projects', path: '/projects' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Blog', path: '/blog' },
    { name: 'Resources', path: '/resources' },
    { name: 'Achievements', path: '/achievements' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setTeamDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {noticeBanner && (
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>{noticeBanner}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-3 text-left group focus:outline-none"
            id="brand-logo-btn"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-red-600 via-red-700 to-slate-900 p-0.5 shadow-md shadow-red-950/40 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:6px_6px]" />
                <Cpu className="w-6 h-6 text-red-500 relative z-10" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-red-500 via-red-400 to-slate-100 bg-clip-text text-transparent">
                  e-Yantra
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/50">
                  LNJPIT
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                LNJPIT Chapra • Bihar
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path || (link.hasDropdown && currentPath.startsWith('/team'));
              
              if (link.hasDropdown) {
                return (
                  <div key={link.name} className="relative">
                    <button
                      onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
                      onMouseEnter={() => setTeamDropdownOpen(true)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                        isActive ? 'text-red-400 bg-red-950/30' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${teamDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {teamDropdownOpen && (
                      <div 
                        onMouseLeave={() => setTeamDropdownOpen(false)}
                        className="absolute top-full left-0 mt-1 w-52 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50 text-sm"
                      >
                        {link.subItems?.map((sub) => (
                          <button
                            key={sub.path}
                            onClick={() => handleNavClick(sub.path)}
                            className={`w-full text-left px-4 py-2 hover:bg-slate-800 transition-colors flex items-center justify-between ${
                              currentPath === sub.path ? 'text-red-400 font-semibold bg-slate-800/50' : 'text-slate-300'
                            }`}
                          >
                            <span>{sub.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? 'text-red-400 font-semibold bg-red-950/30 border-b-2 border-red-500' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors focus:outline-none"
              title="Global Search"
              id="global-search-btn"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAI}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-red-400 border border-red-900/50 transition-all shadow-sm group"
              id="ask-eyantra-ai-btn"
            >
              <Bot className="w-4 h-4 text-red-500 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Join Us CTA */}
            <button
              onClick={() => handleNavClick('/join')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-md shadow-red-950/50 transition-all"
              id="join-community-nav-btn"
            >
              Join Us
            </button>

            {/* User Auth Dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                  >
                    <img 
                      src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-red-600/50"
                    />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-2 z-50 text-sm">
                      <div className="px-4 py-2 border-b border-slate-800">
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <span className="mt-1 inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/40">
                          {user.role}
                        </span>
                      </div>

                      <button
                        onClick={() => { setUserDropdownOpen(false); handleNavClick('/profile'); }}
                        className="w-full text-left px-4 py-2 text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2 font-medium"
                      >
                        <User className="w-4 h-4 text-red-400" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => { setUserDropdownOpen(false); handleNavClick('/dashboard'); }}
                        className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-2"
                      >
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        <span>Member Portal</span>
                      </button>

                      {(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && (
                        <button
                          onClick={() => { setUserDropdownOpen(false); handleNavClick('/admin'); }}
                          className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-800 transition-colors flex items-center gap-2 font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-red-500" />
                          <span>Admin Control Center</span>
                        </button>
                      )}

                      <div className="border-t border-slate-800 mt-1 pt-1">
                        <button
                          onClick={() => { setUserDropdownOpen(false); onLogout(); }}
                          className="w-full text-left px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenAuth}
                    className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                    id="sign-in-btn"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => handleNavClick(link.path)}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                currentPath === link.path ? 'bg-red-950/40 text-red-400 font-bold' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              {link.name}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-900">
            <button
              onClick={() => handleNavClick('/join')}
              className="w-full py-2.5 rounded-lg bg-red-600 text-white font-semibold text-sm shadow-md text-center"
            >
              Join e-Yantra LNJPIT
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
