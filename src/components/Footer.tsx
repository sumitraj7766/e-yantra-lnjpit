import React from 'react';
import { Mail, Phone, MapPin, Github, Linkedin, Instagram, Youtube, Cpu, ExternalLink } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, navigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-600 p-0.5 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-white">e-Yantra LNJPIT</span>
                <p className="text-xs text-red-500 font-medium">LNJPIT Chapra • Bihar</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official student robotics and technology community at Lok Nayak Jai Prakash Institute of Technology (LNJPIT), Chapra. Fostering hands-on engineering, innovation, ROS 2 navigation, embedded system design, and AI models.
            </p>
            <div className="flex items-center gap-3 text-slate-400 pt-2">
              <a href={settings.githubUrl} target="_blank" rel="noreferrer" className="hover:text-red-400 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href={settings.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-red-400 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-red-400 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={settings.youtubeUrl} target="_blank" rel="noreferrer" className="hover:text-red-400 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-slate-900 pb-2">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              {['About e-Yantra', 'Team Leadership', 'Faculty Mentors', 'Student Projects', 'Events & Workshops', 'Gallery & Campus', 'Learning Resources', 'Achievements'].map((item, idx) => {
                const paths = ['/about', '/team', '/team/faculty', '/projects', '/events', '/gallery', '/resources', '/achievements'];
                return (
                  <li key={item}>
                    <button 
                      onClick={() => navigate(paths[idx])} 
                      className="hover:text-red-400 transition-colors flex items-center gap-1.5"
                    >
                      <span>›</span> {item}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Technical Domains */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-slate-900 pb-2">
              Technical Domains
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                'Robotics & Kinematics (ROS 2)',
                'Embedded Firmware & ESP32',
                'Internet of Things (LoRaWAN)',
                'Artificial Intelligence & Computer Vision',
                'Computer Architecture & Microcontrollers',
                'PCB Design & Hardware Fabrication',
                '3D CAD & Mechanical Design'
              ].map(domain => (
                <li key={domain} className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <span>{domain}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Location Info */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-slate-900 pb-2">
              Contact & Institute
            </h4>
            <div className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>LNJPIT Campus, Chapra, Saran, Bihar - 841302, India</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-red-500 shrink-0" />
              <a href={`mailto:${settings.officialEmail}`} className="hover:text-red-400">
                {settings.officialEmail}
              </a>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-red-500 shrink-0" />
              <span>{settings.phone}</span>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => navigate('/contact')}
                className="w-full py-2 px-3 rounded bg-slate-900 hover:bg-slate-800 text-red-400 border border-slate-800 font-medium text-xs flex items-center justify-center gap-1.5"
              >
                <span>Official Contact Form</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 e-Yantra LNJPIT. All rights reserved. Lok Nayak Jai Prakash Institute of Technology, Chapra, Bihar.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/privacy')} className="hover:text-slate-300">Privacy Policy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-slate-300">Terms & Conditions</button>
            <button onClick={() => navigate('/faq')} className="hover:text-slate-300">FAQ</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
