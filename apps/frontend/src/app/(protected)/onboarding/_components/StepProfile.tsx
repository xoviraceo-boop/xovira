import React, { useMemo, useState } from 'react';
import { CheckCircle, User, Settings, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';

export default function StepProfile() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    avatar: null
  });

  return (
    <div className="relative">
      <AnimatedBackground />
      <div className="relative space-y-6 py-8">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full mb-4">
            <User className="w-7 h-7 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">Your Profile</h2>
          <p className="text-slate-400">Tell us a bit about yourself</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Avatar Upload */}
          <div className="flex justify-center">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl group-hover:scale-105 transition-transform">
                {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium">Change</span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">@</span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full pl-8 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                  placeholder="johndoe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}