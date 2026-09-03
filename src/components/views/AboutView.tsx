import React from 'react';
import { Cpu, Target, Eye, ShieldCheck, Award, Layers, Clock, Users, BookOpen } from 'lucide-react';

interface AboutViewProps {
  navigate: (path: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ navigate }) => {
  const milestones = [
    { year: '2023', title: 'e-Yantra LNJPIT Establishment', desc: 'Formal initiation of e-Yantra lab under LNJPIT Chapra with backing from college leadership.' },
    { year: '2024', title: 'First Batch Training Bootcamps', desc: 'Trained 100+ students across ECE & CSE in C++, Arduino microcontrollers, and PCB soldering.' },
    { year: '2025', title: 'National Competition Top 10', desc: 'Selected among top 10 finalists in National e-Yantra Robotics Challenge (eYRC) with AgriBot Rover.' },
    { year: '2026', title: 'Campus IoT Grid & Digital Portal', desc: 'Deployed campus-wide IoT environmental sensors and launched modern official digital management platform.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-slate-100">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">About Our Community</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">e-Yantra LNJPIT</h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Lok Nayak Jai Prakash Institute of Technology (LNJPIT), Chapra, Bihar, India
        </p>
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="p-3 rounded-xl bg-red-950 border border-red-800/80 text-red-400 w-max">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Our Vision</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            To establish LNJPIT Chapra as a premier regional hub for robotics, embedded hardware design, artificial intelligence, and autonomous systems innovation in Bihar.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="p-3 rounded-xl bg-red-950 border border-red-800/80 text-red-400 w-max">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Our Mission</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            To empower students with hands-on technical skills, ROS 2 navigation expertise, low-cost agricultural rover engineering, and state-level hackathon participation through structured mentorship.
          </p>
        </div>
      </div>

      {/* Learning Philosophy */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold text-white">Our Learning Philosophy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="space-y-2">
            <h4 className="font-bold text-red-400 text-sm">1. Hardware First</h4>
            <p className="leading-relaxed">We believe real engineering happens when students assemble motor drivers, solder double-sided PCBs, and debug microcontroller signals with oscilloscopes.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-red-400 text-sm">2. Modern Software Stacks</h4>
            <p className="leading-relaxed">From ROS 2 Humble navigation trees to FreeRTOS tasks and YOLOv8 neural network inference on edge hardware.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-red-400 text-sm">3. Peer-to-Peer Mentorship</h4>
            <p className="leading-relaxed">Senior coordinators guide junior batches, ensuring continuous knowledge transfer and project continuity across academic years.</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-white text-center">Our Journey & Milestones</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {milestones.map((m, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 relative">
              <span className="text-xs font-bold text-red-500 bg-red-950 px-2.5 py-1 rounded border border-red-800/50">
                {m.year}
              </span>
              <h3 className="font-bold text-white text-sm pt-2">{m.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
