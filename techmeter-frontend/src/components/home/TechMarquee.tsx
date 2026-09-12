import React from 'react';
import {
  Code2,
  Cpu,
  Database,
  Globe,
  Layers,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  Terminal,
} from 'lucide-react';

interface TechItem {
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const technologies: TechItem[] = [
  { name: 'React 19 & Next.js', category: 'Frontend', icon: Globe, color: 'text-sky-500' },
  { name: 'TypeScript & Node', category: 'Fullstack', icon: Code2, color: 'text-indigo-500' },
  { name: 'Python & AI / LLMs', category: 'Machine Learning', icon: Cpu, color: 'text-emerald-500' },
  { name: 'Docker & Kubernetes', category: 'DevOps & Cloud', icon: Layers, color: 'text-blue-500' },
  { name: 'C# & .NET Core', category: 'Backend Enterprise', icon: Server, color: 'text-purple-500' },
  { name: 'PostgreSQL & Redis', category: 'Databases', icon: Database, color: 'text-amber-500' },
  { name: 'Cybersecurity & Auth', category: 'Security', icon: Shield, color: 'text-rose-500' },
  { name: 'React Native & Flutter', category: 'Mobile Apps', icon: Smartphone, color: 'text-cyan-500' },
  { name: 'GraphQL & WebSockets', category: 'Real-Time APIs', icon: Terminal, color: 'text-violet-500' },
  { name: 'Cloud Architecture AWS', category: 'Cloud Infrastructure', icon: Sparkles, color: 'text-orange-500' },
];

export const TechMarquee: React.FC = () => {
  return (
    <div className="relative py-8 bg-slate-50/70 dark:bg-gray-900/40 border-y border-gray-100 dark:border-gray-800/80 overflow-hidden">
      {/* Left/Right Gradient Edge Masks for Smooth Infinite Look */}
      <div className="absolute top-0 bottom-0 left-0 w-20 sm:w-32 bg-gradient-to-r from-slate-50 dark:from-gray-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-20 sm:w-32 bg-gradient-to-l from-slate-50 dark:from-gray-900 to-transparent z-10 pointer-events-none" />

      {/* Infinite Scrolling Track */}
      <div className="animate-marquee flex items-center space-x-4">
        {[...technologies, ...technologies].map((tech, idx) => {
          const Icon = tech.icon;
          return (
            <div
              key={idx}
              className="flex items-center space-x-2.5 px-4 py-2 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition duration-200 cursor-default flex-shrink-0"
            >
              <div className={`p-1.5 rounded-xl bg-gray-50 dark:bg-gray-900/80 ${tech.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                  {tech.name}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                  {tech.category}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TechMarquee;
