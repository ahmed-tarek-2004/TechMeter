import React, { useState, useEffect } from 'react';
import {
  Code,
  BookOpen,
  Award,
  Play,
  CheckCircle2,
  Terminal,
  Layers,
  Loader2,
  GitBranch,
  ShieldCheck,
} from 'lucide-react';

const codeSnippets = {
  react: `// Modern Fullstack Architecture
import { createEngine, useLearner } from '@techmeter/core';

export default function DistributedApp() {
  const { isConnected } = useSignalR('/hub/learning');
  return <Sandbox runtime="node22" status="production-ready" />;
}`,
  python: `# AI & Distributed Intelligence
import torch
import torch.nn as nn

class TransformerBlock(nn.Module):
    def __init__(self, embed_dim=768, heads=12):
        super().__init__()
        self.attn = nn.MultiheadAttention(embed_dim, heads)
        self.norm = nn.LayerNorm(embed_dim)

    def forward(self, x):
        return self.norm(x + self.attn(x, x, x)[0])`,
  cloud: `# Production DevOps & Kubernetes Pipeline
apiVersion: apps/v1
kind: Deployment
metadata:
  name: techmeter-service-mesh
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api-gateway
        image: techmeter/core:v2.4
        ports:
        - containerPort: 8080`,
};

export const HeroShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'code' | 'curriculum' | 'certificate'>('code');
  const [activeLang, setActiveLang] = useState<'react' | 'python' | 'cloud'>('react');
  const [isRunning, setIsRunning] = useState(false);
  const [runSuccess, setRunSuccess] = useState(false);

  const handleRunCode = () => {
    setIsRunning(true);
    setRunSuccess(false);
    setTimeout(() => {
      setIsRunning(false);
      setRunSuccess(true);
    }, 500);
  };

  useEffect(() => {
    if (runSuccess) {
      const timer = setTimeout(() => setRunSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [runSuccess]);

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Main Glassmorphic Container */}
      <div className="relative bg-slate-900/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/80 dark:border-gray-800 shadow-2xl overflow-hidden transition-colors duration-200">
        {/* Terminal Header */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="ml-2 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>techmeter-sandbox</span>
            </span>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Sandbox</span>
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'curriculum'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Curriculum</span>
            </button>
            <button
              onClick={() => setActiveTab('certificate')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'certificate'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Credential</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Interactive Code Sandbox */}
        {activeTab === 'code' && (
          <div className="p-4 sm:p-5 font-mono text-xs">
            {/* Language Selector */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
              <div className="flex space-x-1.5">
                {(['react', 'python', 'cloud'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      activeLang === lang
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-950/60'
                    }`}
                  >
                    {lang === 'react' ? 'app.tsx' : lang === 'python' ? 'model.py' : 'deploy.yaml'}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-semibold text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                {isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )}
                <span>{isRunning ? 'Running...' : 'Run Code'}</span>
              </button>
            </div>

            {/* Code Body with Line Numbers */}
            <div className="flex text-slate-300 leading-relaxed overflow-x-auto min-h-[160px] bg-slate-950/70 p-3 rounded-xl border border-slate-800/60">
              <div className="select-none text-slate-600 pr-3 text-right font-mono text-[11px] border-r border-slate-800 mr-3">
                {codeSnippets[activeLang].split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <pre className="overflow-x-auto text-[11.5px]">
                <code>{codeSnippets[activeLang]}</code>
              </pre>
            </div>

            {/* Run Result Output Toast / Console Log */}
            {runSuccess && (
              <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-between text-xs transition-all duration-200">
                <span className="flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Build complete: 0 errors, 14 passing tests (100% coverage)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">38ms</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Interactive Curriculum Playlist */}
        {activeTab === 'curriculum' && (
          <div className="p-4 sm:p-5 space-y-2 min-h-[230px]">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Layers className="w-3.5 h-3.5" /> Fullstack Architecture Track
              </span>
              <span className="font-mono text-slate-300">4 of 5 Completed</span>
            </div>

            {[
              { title: '1. Advanced TypeScript Patterns & Type Systems', time: '45m', done: true },
              { title: '2. High-Performance React 19 State & Suspense', time: '50m', done: true },
              { title: '3. Real-Time Distributed SignalR & WebSockets', time: '40m', done: true },
              { title: '4. Microservices Architecture & Container Mesh', time: '1h 15m', current: true },
              { title: '5. Production CI/CD Pipeline & Observability', time: '55m', done: false },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                  item.current
                    ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                    : item.done
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                    : 'bg-slate-950/20 border-slate-800/40 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : item.current ? (
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-400 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
                  )}
                  <span className="text-xs font-medium truncate">{item.title}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-[11px] font-mono text-slate-400">{item.time}</span>
                  {item.current && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Verified Certificate Badge */}
        {activeTab === 'certificate' && (
          <div className="p-6 text-center space-y-3.5 min-h-[230px] flex flex-col items-center justify-center">
            <div className="relative inline-block">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                  <Award className="w-7 h-7" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 p-0.5 bg-emerald-500 rounded-full text-white">
                <CheckCircle2 className="w-3 h-3" />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">Verified TechMeter Master Credential</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Cryptographically signed and shareable to LinkedIn, GitHub, and resumes.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-indigo-400 font-semibold">ID:</span>
              <span>TM-2026-SHA256-8F92D</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        )}

        {/* Bottom Status Bar */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="text-[11px] text-slate-300">Ready • Node v22.12</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="hidden sm:inline flex items-center gap-1">
              <GitBranch className="w-3 h-3" /> main
            </span>
            <span>UTF-8</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroShowcase;
