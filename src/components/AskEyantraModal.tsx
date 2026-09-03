import React, { useState } from 'react';
import { X, Bot, Send, Sparkles, Cpu, Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';
import { AIProjectIdeaResponse } from '../types';

interface AskEyantraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AskEyantraModal: React.FC<AskEyantraModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'project'>('chat');
  
  // Chat state
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: 'Hello! I am **Ask e-Yantra**, your AI assistant for e-Yantra LNJPIT Chapra. Ask me anything about our robotics projects, faculty mentors, upcoming workshops, ROS 2 bootcamps, or how to join our student community!'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // AI Project Assistant state
  const [goal, setGoal] = useState('');
  const [domain, setDomain] = useState('Robotics');
  const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [blueprint, setBlueprint] = useState<AIProjectIdeaResponse | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);

  if (!isOpen) return null;

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || loadingChat) return;

    const userText = inputQuery.trim();
    setInputQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoadingChat(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userText })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.answer || 'Thank you for your question!' }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I ran into an error retrieving answer. Please try again.' }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleGenerateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || loadingProject) return;

    setLoadingProject(true);
    setBlueprint(null);

    try {
      const res = await fetch('/api/ai/project-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, domain, experienceLevel })
      });
      const data = await res.json();
      setBlueprint(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProject(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl h-[85vh] max-h-[700px] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-950 border border-red-800/60 text-red-500">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                Ask e-Yantra AI Assistant
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-900/60 text-red-300 border border-red-700/50">
                  Gemini 2.5
                </span>
              </h3>
              <p className="text-xs text-slate-400">Intelligent Q&A and Engineering Project Blueprint Generator</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Community Knowledge Q&A</span>
          </button>

          <button
            onClick={() => setActiveTab('project')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'project'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>AI Project Architect</span>
          </button>
        </div>

        {/* TAB 1: CHAT */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center text-red-400 shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-red-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/60'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  </div>
                </div>
              ))}

              {loadingChat && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 p-3 rounded-xl border border-red-900/50 w-max">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Consulting e-Yantra LNJPIT knowledge base...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="mt-4 flex gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                placeholder="Ask about rovers, faculty, ROS 2, events, or how to join..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                disabled={loadingChat || !inputQuery.trim()}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: AI PROJECT ARCHITECT */}
        {activeTab === 'project' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <form onSubmit={handleGenerateProject} className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  What project idea or goal do you want to build?
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder="e.g. An autonomous floor cleaning rover with LIDAR mapping"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Domain</label>
                  <select
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Robotics">Robotics & Kinematics</option>
                    <option value="AI/ML">AI & Computer Vision</option>
                    <option value="IoT">IoT & Wireless Networks</option>
                    <option value="Embedded">Embedded Systems & Firmware</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Skill Level</label>
                  <select
                    value={experienceLevel}
                    onChange={e => setExperienceLevel(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Beginner">Beginner (1st Year)</option>
                    <option value="Intermediate">Intermediate (2nd/3rd Year)</option>
                    <option value="Advanced">Advanced (4th Year / Senior)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingProject || !goal.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold text-xs rounded-lg shadow transition-all flex items-center justify-center gap-2"
              >
                {loadingProject ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Architecting Hardware & Software Stack...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4" />
                    Generate Technical Project Blueprint
                  </>
                )}
              </button>
            </form>

            {/* Generated Blueprint View */}
            {blueprint && (
              <div className="bg-slate-950 p-4 rounded-xl border border-red-900/60 space-y-4 text-xs">
                <div>
                  <h4 className="text-base font-bold text-red-400 mb-1">{blueprint.title}</h4>
                  <p className="text-slate-300 leading-relaxed">{blueprint.summary}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <h5 className="font-bold text-white mb-2 flex items-center gap-1.5 text-xs">
                      <Cpu className="w-3.5 h-3.5 text-red-400" />
                      Hardware Components
                    </h5>
                    <ul className="space-y-1 text-slate-300">
                      {blueprint.hardwareList?.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <h5 className="font-bold text-white mb-2 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-red-400" />
                      Software & Tools
                    </h5>
                    <ul className="space-y-1 text-slate-300">
                      {blueprint.softwareTools?.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <h5 className="font-bold text-white mb-1">Learning Roadmap</h5>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300">
                    {blueprint.learningSteps?.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
