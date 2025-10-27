"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Search, ChevronRight, Play } from 'lucide-react';

export const FeatureSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const features = [
    { icon: '💰', title: 'Seeking Investors', description: 'Raise funding for your startup.', delay: 0 },
    { icon: '🎯', title: 'Finding Mentors', description: 'Get guidance from experienced professionals.', delay: 100 },
    { icon: '👥', title: 'Building Team', description: 'Recruit talented team members.', delay: 200 },
    { icon: '🤝', title: 'Finding Co-founders', description: 'Partner with like-minded entrepreneurs.', delay: 300 },
    { icon: '🔗', title: 'Strategic Partners', description: 'Form business partnerships.', delay: 400 },
    { icon: '🎪', title: 'Acquiring Customers', description: 'Find your first customers.', delay: 500 },
  ];

  return (
    <section 
      ref={sectionRef}
      id="features" 
      className={`py-20 sm:py-32 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-300 mb-4">
            Why Choose ConnectHub
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
              Build & Grow
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, description, delay }: any) => {
  return (
    <div 
      className="group bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-500/20"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h4 className="text-xl font-bold mb-3 text-white">{title}</h4>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
};
