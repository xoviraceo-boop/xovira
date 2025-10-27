
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';

export default function StepFinish() {
  return (
    <div className="relative">
      <AnimatedBackground />
      <div className="relative space-y-6 py-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-2xl opacity-40 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              All Set!
            </h2>
            <p className="text-lg text-slate-400 max-w-md mx-auto">
              Your profile is ready. Click Finish to explore your personalized dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
            {[
              { label: 'Profile Complete', value: '100%', color: 'from-cyan-500 to-blue-500' },
              { label: 'Preferences Set', value: '✓', color: 'from-purple-500 to-pink-500' },
              { label: 'Ready to Start', value: '🚀', color: 'from-green-500 to-emerald-500' }
            ].map((stat, i) => (
              <div key={i} className="p-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl">
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
