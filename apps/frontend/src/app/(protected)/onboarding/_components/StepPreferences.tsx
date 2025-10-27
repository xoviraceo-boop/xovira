import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';

export default function StepPreferences() {
  type Preference = {
    interests: string[];
    notifications: boolean;
    visibility: string;
  };

  const [preferences, setPreferences] = useState<Preference>({
    interests: [] as string[],
    notifications: true,
    visibility: 'public'
  });

  const interests = [
    '🎨 Design', '💻 Development', '📱 Mobile', '🤖 AI/ML',
    '🎮 Gaming', '📊 Analytics', '🎯 Marketing', '✍️ Content',
    '🎵 Music', '📸 Photography', '🏃 Fitness', '🍳 Cooking'
  ];

  const toggleInterest = (interest: string) => {
    setPreferences((prev: Preference) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="relative">
      <AnimatedBackground />
      <div className="relative space-y-6 py-8">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full mb-4">
            <Settings className="w-7 h-7 text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">Preferences</h2>
          <p className="text-slate-400">Customize your experience</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Interests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Select Your Interests</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {interests.map((interest, i) => (
                <button
                  key={i}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                    preferences.interests.includes(interest)
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25 scale-105'
                      : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-cyan-500/50'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Profile Visibility</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['public', 'friends', 'private'].map((vis) => (
                <button
                  key={vis}
                  onClick={() => setPreferences({...preferences, visibility: vis})}
                  className={`p-4 rounded-xl text-left transition-all duration-300 ${
                    preferences.visibility === vis
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50'
                      : 'bg-slate-800/30 border border-slate-700/50 hover:border-purple-500/30'
                  }`}
                >
                  <div className="font-medium text-white capitalize mb-1">{vis}</div>
                  <div className="text-xs text-slate-400">
                    {vis === 'public' ? 'Visible to everyone' : vis === 'friends' ? 'Only your friends' : 'Only you'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <div>
              <h3 className="font-medium text-white">Enable Notifications</h3>
              <p className="text-sm text-slate-400">Receive updates and alerts</p>
            </div>
            <button
              onClick={() => setPreferences({...preferences, notifications: !preferences.notifications})}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                preferences.notifications ? 'bg-gradient-to-r from-cyan-500 to-purple-600' : 'bg-slate-700'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                preferences.notifications ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}