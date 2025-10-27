"use client";
import React, { useState, useEffect } from 'react';
import { Menu, X, Search, ChevronRight, Play } from 'lucide-react';

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-300 mb-4">
            Simple Process
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            From Sign-Up to{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
              Success
            </span>
            {' '}with few steps
          </h2>
        </div>
        <div className="aspect-video bg-slate-800/50 rounded-3xl border border-cyan-500/10 flex items-center justify-center hover:border-cyan-500/30 transition-all duration-500">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300">
              <Play size={32} className="text-slate-900" />
            </div>
            <p className="text-gray-400">Video Demo Coming Soon</p>
          </div>
        </div>
      </div>
    </section>
  );
};
