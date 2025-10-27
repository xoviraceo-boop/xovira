"use client";
import { CheckCircle, User, Settings, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import React, { useMemo, useState } from "react";
import StepWelcome from "./StepWelcome";
import StepProfile from "./StepProfile";
import StepPreferences from "./StepPreferences";
import StepFinish from "./StepFinish";
import { trpc } from '@/lib/trpc';
import { useSession } from 'next-auth/react';

export default function StepSwitcher() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { update: updateSession } = useSession();
  const update = trpc.onboarding.update.useMutation();

  const steps = [
    { component: StepWelcome, label: 'Welcome', icon: Sparkles },
    { component: StepProfile, label: 'Profile', icon: User },
    { component: StepPreferences, label: 'Preferences', icon: Settings },
    { component: StepFinish, label: 'Finish', icon: CheckCircle }
  ];

  const Current = steps[step].component;

  const goNext = async () => {
    const next = Math.min(step + 1, 3);
    await update.mutateAsync({ step: next });
    setStep(next);
  };

  const complete = async () => {
    await update.mutateAsync({ completed: true, step: 3 });
    await updateSession({ onboardingCompleted: true });
    window.location.replace("/home");
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-500"
                style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Step Indicators */}
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isCompleted = i < step;
              
              return (
                <div key={i} className="relative flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50'
                      : isActive
                      ? 'bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/50 scale-110'
                      : 'bg-slate-800 border-2 border-slate-700'
                  }`}>
                    <Icon className={`w-5 h-5 ${isCompleted || isActive ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${
                    isActive ? 'text-cyan-400' : isCompleted ? 'text-green-400' : 'text-slate-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <Current />
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4 mt-8 pt-8 border-t border-slate-800/50">
              <div className="text-sm text-slate-500">
                Step {step + 1} of {steps.length}
              </div>
              
              <div className="flex items-center gap-3">
                {step > 0 && step < 3 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    disabled={isLoading}
                    className="px-6 py-3 bg-slate-800/50 border border-slate-700/50 text-slate-300 rounded-xl font-medium hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    onClick={goNext}
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={complete}
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Finishing...
                      </>
                    ) : (
                      <>
                        Finish
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Helper Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Press <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs">ESC</kbd> to save and exit
          </p>
        </div>
      </div>
    </div>
  );
}