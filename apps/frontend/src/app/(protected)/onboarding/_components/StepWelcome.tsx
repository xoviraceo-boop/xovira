import React, { useMemo, useState } from 'react';
import { CheckCircle, User, Settings, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';

export default function StepWelcome() {
  return (
    <div className="relative">
      <AnimatedBackground />
      <div className="relative space-y-6 py-8">
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur-2xl opacity-30 animate-pulse" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome to Xovira
          </h2>
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <p className="text-lg text-slate-400 max-w-md mx-auto leading-relaxed">
            Let's personalize your experience with a quick setup. This will only take a minute.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          {[
            { icon: User, title: 'Profile', desc: 'Set up your identity' },
            { icon: Settings, title: 'Preferences', desc: 'Customize your experience' },
            { icon: CheckCircle, title: 'Complete', desc: 'Start your journey' }
          ].map((item, i) => (
            <div key={i} className="p-4 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:border-cyan-500/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-lg">
                  <item.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white">{item.title}</h3>
              </div>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}





