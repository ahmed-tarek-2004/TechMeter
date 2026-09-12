import React, { useState } from 'react';
import {
  Play,
  MessageSquare,
  Award,
  Sparkles,
  CheckCircle2,
  Zap,
  Shield,
  Send,
  Lock,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const BentoFeatures: React.FC = () => {
  const [mockMsg, setMockMsg] = useState('');
  const [messagesList, setMessagesList] = useState([
    { text: 'How do I optimize this React 19 hook for large datasets?', sender: 'student' },
    { text: 'Use useMemo with shallow dependency array and virtualize the feed!', sender: 'instructor' },
  ]);

  const handleSendMockMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockMsg.trim()) return;
    setMessagesList((prev) => [
      ...prev,
      { text: mockMsg, sender: 'student' },
    ]);
    setMockMsg('');
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50 mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Engineered for Mastery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Everything You Need to Master Any Tech Stack
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            Built from the ground up for hands-on learning with real-time feedback, interactive sandboxes, and direct mentor guidance.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Card 1: Interactive Video & Code Player */}
          <div className="bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-950 dark:from-indigo-950 dark:via-slate-900 dark:to-gray-950 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/20 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-indigo-400/40 transition duration-200">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Play className="w-5 h-5 fill-current" />
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  HD Video Streaming
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
                Ultra-Smooth Learning Player
              </h3>
              <p className="text-xs sm:text-sm text-indigo-100 dark:text-slate-300 max-w-md leading-relaxed">
                Seamless chapter navigation, playback speed controls, interactive code attachments, and automatic progress sync across all your devices.
              </p>
            </div>

            {/* Visual Mockup inside card */}
            <div className="mt-8 bg-slate-950/90 rounded-2xl p-4 border border-indigo-400/20 dark:border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                <span>04:15 / 18:30</span>
                <span className="text-indigo-400 font-semibold">Lesson 7 • Async Patterns</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-indigo-500 rounded-full" />
              </div>
            </div>
          </div>

          {/* Card 2: Real-time SignalR Instructor Chat */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-gray-800 shadow-xs hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
                  <MessageSquare className="w-5 h-5" />
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Real-time SignalR Hub
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Direct Instructor Communication
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Never get stuck. Ask technical questions directly to course providers with instant live chat and online availability status.
              </p>
            </div>

            {/* Interactive Chat Bubble Simulator */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3.5 border border-gray-200/80 dark:border-gray-700/60 space-y-2">
              {messagesList.slice(-2).map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-1.5 rounded-xl text-xs ${
                      msg.sender === 'student'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <p className="text-[11px]">{msg.text}</p>
                  </div>
                </div>
              ))}

              <form onSubmit={handleSendMockMsg} className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  value={mockMsg}
                  onChange={(e) => setMockMsg(e.target.value)}
                  placeholder="Type a message to test chat..."
                  className="flex-1 px-3 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  title="Send"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Card 3: Cryptographically Verified Certificates */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-gray-800 shadow-xs hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
                  <Award className="w-5 h-5" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
                  Accredited
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Industry-Recognized Certificates
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Earn verified digital certificates with unique cryptographic verification IDs ready to showcase on LinkedIn and GitHub.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Fullstack Architecture 2026</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">ID: TM-2026-SHA256-8F92D</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            </div>
          </div>

          {/* Card 4: Secure Global Payments with Stripe */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-gray-800 shadow-xs hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Shield className="w-5 h-5" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                  Stripe PCI-DSS Level 1
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Instant Access & Secure Checkout
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Enroll with confidence using encrypted payments via Stripe with instant access, automated invoices, and lifetime curriculum updates.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
              </span>
              <Link
                to="/courses"
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                <span>Browse catalog</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoFeatures;
