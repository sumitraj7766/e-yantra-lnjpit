import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { AskEyantraModal } from './components/AskEyantraModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

import { HomeView } from './components/views/HomeView';
import { AboutView } from './components/views/AboutView';
import { TeamView } from './components/views/TeamView';
import { ProjectsView } from './components/views/ProjectsView';
import { EventsView } from './components/views/EventsView';
import { GalleryView } from './components/views/GalleryView';
import { BlogView } from './components/views/BlogView';
import { ResourcesView } from './components/views/ResourcesView';
import { AchievementsView } from './components/views/AchievementsView';
import { JoinCommunityView } from './components/views/JoinCommunityView';
import { ContactView } from './components/views/ContactView';
import { FaqPrivacyTermsView } from './components/views/FaqPrivacyTermsView';
import { MemberDashboardView } from './components/views/MemberDashboardView';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import { ProfileView } from './components/views/ProfileView';
import { MemberProfileView } from './components/views/MemberProfileView';

import {
  User,
  FacultyMember,
  StudentCoordinator,
  TechnicalLead,
  Project,
  EventItem,
  BlogPost,
  GalleryItem,
  LearningResource,
  Achievement,
  SiteSettings,
  FAQItem
} from './types';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('eyantra_jwt_token'));

  // Modals & First Visit Flow
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // First time visitor account creation invitation
  useEffect(() => {
    const hasVisited = localStorage.getItem('eyantra_has_visited');
    const existingToken = localStorage.getItem('eyantra_jwt_token') || localStorage.getItem('eyantra_token');
    if (!hasVisited && !existingToken) {
      localStorage.setItem('eyantra_has_visited', 'true');
      setIsFirstVisit(true);
      setAuthInitialMode('register');
      const timer = setTimeout(() => {
        setIsAuthModalOpen(true);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, []);

  // App Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [coordinators, setCoordinators] = useState<StudentCoordinator[]>([]);
  const [technicalLeads, setTechnicalLeads] = useState<TechnicalLead[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'e-Yantra LNJPIT',
    tagline: 'Robotics & Engineering Excellence at LNJPIT Chapra',
    officialEmail: 'lnjpiteyantra@gmail.com',
    phone: '+91 94310 00000',
    address: 'LNJPIT Campus, Chapra, Saran, Bihar - 841302',
    githubUrl: 'https://github.com/eyantra-lnjpit',
    linkedinUrl: 'https://linkedin.com/company/eyantra-lnjpit',
    instagramUrl: 'https://instagram.com/eyantra_lnjpit',
    youtubeUrl: 'https://youtube.com/@eyantra_lnjpit',
    noticeBanner: '🚀 Registration Open: e-LNJPIT HackRobotics 2026 & ROS 2 Navigation Bootcamp!'
  });

  const [loading, setLoading] = useState(true);

  // Synchronize history navigation
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      setCurrentPath(typeof p === 'string' && p.trim() ? p : '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: any) => {
    if (typeof path === 'number') {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      path = '/';
    }
    const cleanPath = typeof path === 'string' && path.trim() ? path.trim() : '/';
    if (cleanPath !== currentPath) {
      window.history.pushState({}, '', cleanPath);
      setCurrentPath(cleanPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Safe JSON fetcher
  const safeFetch = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) return null;
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  };

  // Function to load all platform data
  const fetchData = async () => {
    try {
      const [
        resProjects,
        resEvents,
        resFaculty,
        resCoords,
        resLeads,
        resBlog,
        resGallery,
        resResources,
        resAch,
        resSet
      ] = await Promise.all([
        safeFetch('/api/projects'),
        safeFetch('/api/events'),
        safeFetch('/api/faculty'),
        safeFetch('/api/coordinators'),
        safeFetch('/api/technical-leads'),
        safeFetch('/api/blog'),
        safeFetch('/api/gallery'),
        safeFetch('/api/resources'),
        safeFetch('/api/achievements'),
        safeFetch('/api/settings')
      ]);

      if (Array.isArray(resProjects)) setProjects(resProjects);
      if (Array.isArray(resEvents)) setEvents(resEvents);
      if (Array.isArray(resFaculty)) setFaculty(resFaculty);
      if (Array.isArray(resCoords)) setCoordinators(resCoords);
      if (Array.isArray(resLeads)) setTechnicalLeads(resLeads);
      if (Array.isArray(resBlog)) setBlogPosts(resBlog);
      if (Array.isArray(resGallery)) setGalleryItems(resGallery);
      if (Array.isArray(resResources)) setResources(resResources);
      if (Array.isArray(resAch)) setAchievements(resAch);
      if (resSet && resSet.settings) {
        setSettings(resSet.settings);
        if (resSet.faqs) setFaqs(resSet.faqs);
      }

      // If user has token, fetch admin datasets
      const currentToken = localStorage.getItem('eyantra_jwt_token') || localStorage.getItem('eyantra_token');
      if (currentToken) {
        try {
          const [resApps, resMsgs, resLogs] = await Promise.all([
            safeFetch('/api/applications', { headers: { Authorization: `Bearer ${currentToken}` } }),
            safeFetch('/api/contact', { headers: { Authorization: `Bearer ${currentToken}` } }),
            safeFetch('/api/audit-logs', { headers: { Authorization: `Bearer ${currentToken}` } })
          ]);
          if (Array.isArray(resApps)) setApplications(resApps);
          if (Array.isArray(resMsgs)) setContactMessages(resMsgs);
          if (Array.isArray(resLogs)) setAuditLogs(resLogs);
        } catch (e) {
          // Non-admin or silent fallback
        }
      }
    } catch (err) {
      console.warn('Note on loading platform data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check auth user status
  useEffect(() => {
    const checkAuth = async () => {
      const activeToken = token || localStorage.getItem('eyantra_jwt_token') || localStorage.getItem('eyantra_token');
      if (!activeToken) return;
      try {
        const data = await safeFetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${activeToken}` }
        });
        if (data && data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('eyantra_jwt_token');
          localStorage.removeItem('eyantra_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('Auth verification notice:', err);
      }
    };
    checkAuth();
  }, [token]);

  // Fetch initial content data
  useEffect(() => {
    fetchData();
  }, [user]);

  const handleLoginSuccess = (newToken: string, loggedUser: User) => {
    localStorage.setItem('eyantra_jwt_token', newToken);
    setToken(newToken);
    setUser(loggedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('eyantra_jwt_token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  // Dynamic router renderer
  const renderCurrentView = () => {
    const safeCurrentPath = typeof currentPath === 'string' && currentPath.trim() ? currentPath.trim() : '/';
    const path = safeCurrentPath.toLowerCase();

    // Home
    if (path === '/') {
      return (
        <HomeView
          navigate={navigate}
          projects={projects}
          events={events}
          faculty={faculty}
          coordinators={coordinators}
          achievements={achievements}
          gallery={galleryItems}
        />
      );
    }

    // About
    if (path === '/about') {
      return (
        <AboutView
          navigate={navigate}
          faculty={faculty}
          coordinators={coordinators}
          achievements={achievements}
        />
      );
    }

    // Team Routes
    if (path.startsWith('/team')) {
      const parts = path.split('/').filter(Boolean);
      if (parts.length > 1) {
        const sub = parts[1];
        if (sub === 'faculty' || sub === 'coordinators' || sub === 'technical-leads' || sub === 'alumni') {
          return (
            <TeamView
              currentPath={currentPath}
              navigate={navigate}
              faculty={faculty}
              coordinators={coordinators}
              technicalLeads={technicalLeads}
              subRoute={sub as any}
            />
          );
        } else {
          // Public Team Member Profile: /team/:slug
          return (
            <MemberProfileView
              idOrSlug={sub}
              onNavigate={navigate}
            />
          );
        }
      }

      return (
        <TeamView
          currentPath={currentPath}
          navigate={navigate}
          faculty={faculty}
          coordinators={coordinators}
          technicalLeads={technicalLeads}
        />
      );
    }

    // Projects Routes
    if (path.startsWith('/projects')) {
      const parts = path.split('/').filter(Boolean);
      const selectedSlug = parts.length > 1 ? parts[1] : undefined;

      return (
        <ProjectsView
          navigate={navigate}
          projects={projects}
          selectedSlug={selectedSlug}
        />
      );
    }

    // Events Routes
    if (path.startsWith('/events')) {
      const parts = path.split('/').filter(Boolean);
      const selectedSlug = parts.length > 1 ? parts[1] : undefined;

      return (
        <EventsView
          navigate={navigate}
          events={events}
          selectedSlug={selectedSlug}
          currentUser={user}
          onRequireAuth={() => {
            setAuthInitialMode('login');
            setIsAuthModalOpen(true);
          }}
        />
      );
    }

    // Gallery
    if (path === '/gallery') {
      return <GalleryView gallery={galleryItems} />;
    }

    // Blog Routes
    if (path.startsWith('/blog')) {
      const parts = path.split('/').filter(Boolean);
      const selectedSlug = parts.length > 1 ? parts[1] : undefined;

      return (
        <BlogView
          navigate={navigate}
          posts={blogPosts}
          selectedSlug={selectedSlug}
        />
      );
    }

    // Resources
    if (path === '/resources') {
      return <ResourcesView resources={resources} />;
    }

    // Achievements
    if (path === '/achievements') {
      return <AchievementsView achievements={achievements} />;
    }

    // Join
    if (path === '/join') {
      return <JoinCommunityView navigate={navigate} />;
    }

    // Contact
    if (path === '/contact') {
      return <ContactView settings={settings} />;
    }

    // FAQ / Privacy / Terms
    if (path === '/faq') {
      return <FaqPrivacyTermsView type="faq" faqs={faqs} />;
    }
    if (path === '/privacy') {
      return <FaqPrivacyTermsView type="privacy" />;
    }
    if (path === '/terms') {
      return <FaqPrivacyTermsView type="terms" />;
    }

    // Dynamic Member Profile Route (/profile or /profile/:idOrSlug)
    if (path.startsWith('/profile')) {
      const parts = path.split('/').filter(Boolean);
      const targetSlugOrId = parts.length > 1 ? parts[1] : undefined;

      if (targetSlugOrId && targetSlugOrId !== 'me') {
        return (
          <MemberProfileView
            idOrSlug={targetSlugOrId}
            onNavigate={navigate}
          />
        );
      }

      return (
        <ProfileView
          currentUser={user}
          targetUserIdOrUsername={targetSlugOrId}
          navigate={navigate}
          projects={projects}
          events={events}
          onUserUpdated={(updatedUser) => {
            setUser(updatedUser);
          }}
          onOpenAuth={() => {
            setAuthInitialMode('register');
            setIsAuthModalOpen(true);
          }}
        />
      );
    }

    // Dashboards
    if (path === '/dashboard') {
      return (
        <MemberDashboardView
          user={user}
          navigate={navigate}
          projects={projects}
          events={events}
          applications={applications}
        />
      );
    }

    if (path === '/admin') {
      return (
        <AdminDashboardView
          user={user}
          navigate={navigate}
          projects={projects}
          events={events}
          faculty={faculty}
          coordinators={coordinators}
          technicalLeads={technicalLeads}
          blogPosts={blogPosts}
          blog={blogPosts}
          gallery={galleryItems}
          resources={resources}
          achievements={achievements}
          settings={settings}
          applications={applications}
          contactMessages={contactMessages}
          auditLogs={auditLogs}
          refreshData={fetchData}
        />
      );
    }

    // Fallback 404
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <h2 className="text-4xl font-extrabold text-red-500">404 - Page Not Found</h2>
        <p className="text-slate-400">The requested e-Yantra LNJPIT page could not be located.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentPath={currentPath}
        navigate={navigate}
        user={user}
        onOpenAuth={(mode) => {
          setAuthInitialMode(typeof mode === 'string' ? mode : 'login');
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenAI={() => setIsAIModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        noticeBanner={settings.noticeBanner}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {loading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Loading e-Yantra LNJPIT Platform...</p>
          </div>
        ) : (
          renderCurrentView()
        )}
      </main>

      {/* Footer */}
      <Footer settings={settings} navigate={navigate} />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authInitialMode}
        isFirstVisit={isFirstVisit}
      />

      <AskEyantraModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        navigate={navigate}
      />
    </div>
  );
}

