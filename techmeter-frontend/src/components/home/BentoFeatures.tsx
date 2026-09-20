import React from 'react';
import {
  Video,
  MessageSquare,
  Award,
  ShieldCheck,
  Zap,
  BookOpen,
} from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'High-Quality Video Lessons',
    description: 'Learn step-by-step with structured modules, downloadable resources, and interactive lesson players.',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-900/50',
  },
  {
    icon: MessageSquare,
    title: 'Direct Instructor Chat',
    description: 'Connect with course instructors in real time to ask questions and get personalized feedback.',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/60 border-violet-100 dark:border-violet-900/50',
  },
  {
    icon: Award,
    title: 'Verified Certificates',
    description: 'Earn digital certificates upon completing courses to showcase your skills on LinkedIn and resumes.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-900/50',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Instant Access',
    description: 'Enroll with secure payment processing and enjoy lifetime access to your enrolled courses.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-900/50',
  },
];

export const BentoFeatures: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50/50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50 mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Why TechMeter</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Built for Modern Tech Learning
          </h2>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Everything you need to master new technologies, build real-world projects, and advance your career.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200/80 dark:border-gray-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border ${feature.bg} ${feature.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BentoFeatures;
