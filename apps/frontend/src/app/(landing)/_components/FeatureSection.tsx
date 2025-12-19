"use client";
import React, { useRef, useEffect } from 'react';
import { TrendingUp, Users, Handshake, Target, Zap, Rocket, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
  gradient?: string;
}

export function FeatureSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const features: Feature[] = [
    { 
      icon: <TrendingUp size={32} />, 
      title: 'Seeking Investors', 
      description: 'Raise funding for your startup with access to a network of verified investors and venture capitalists.',
      gradient: 'from-purple-500/20 to-cyan-500/20'
    },
    { 
      icon: <Users size={32} />, 
      title: 'Building Team', 
      description: 'Recruit talented team members from a pool of skilled professionals ready to join your venture.',
      highlight: true,
      gradient: 'from-cyan-500/20 to-teal-500/20'
    },
    { 
      icon: <Handshake size={32} />, 
      title: 'Finding Co-founders', 
      description: 'Partner with like-minded entrepreneurs who share your vision and complement your skills.',
      gradient: 'from-teal-500/20 to-cyan-500/20'
    },
    { 
      icon: <Target size={32} />, 
      title: 'Finding Mentors', 
      description: 'Get guidance from experienced professionals who have built successful companies and teams.',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    { 
      icon: <Zap size={32} />, 
      title: 'Strategic Partners', 
      description: 'Form business partnerships that help you scale faster and reach new markets effectively.',
      gradient: 'from-cyan-500/20 to-blue-500/20'
    },
    { 
      icon: <Rocket size={32} />, 
      title: 'Acquiring Customers', 
      description: 'Find your first customers and early adopters who believe in your product and vision.',
      highlight: true,
      gradient: 'from-teal-500/20 to-purple-500/20'
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Text Animation
      gsap.from('.hero-text-animate', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power4.out'
      });

      // Grid Cards Animation
      const cards = cardsRef.current?.children;
      if (cards) {
        Array.from(cards).forEach((card, index) => {
          gsap.fromTo(card,
            { opacity: 0, y: 60, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              },
              delay: index * 0.1
            }
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="font-sans overflow-hidden">
      {/* SECTION 1: SYNTHESIA STYLE HEADER */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16">
          <div className="max-w-4xl">
            <div className="hero-text-animate inline-block px-4 py-1.5 border border-slate-200 rounded-full text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-8">
              ConnectHub Features
            </div>
            <h1 className="hero-text-animate text-5xl md:text-[84px] font-bold text-slate-100 leading-[0.95] tracking-tight">
              One platform to create, <br />
              scale and publish startups.
            </h1>
          </div>
        </div>

        {/* FEATURE BANNER (Matches the "AI Avatar" section in your image) */}
        <div className="hero-text-animate relative w-full rounded-[40px] bg-[#f8f9fb] p-10 md:p-20 overflow-hidden border border-slate-100 flex items-center">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Create your own expressive Startup Team
            </h2>
            <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-md">
              Your vision speaks 140+ languages, fluently, and with uncanny precision. 
              And yes, you keep full control over your growth.
            </p>
            <div className="inline-block px-4 py-2 bg-white rounded-full text-[11px] font-bold uppercase tracking-widest text-slate-800 shadow-sm border border-slate-100">
              Expressive Networks
            </div>
          </div>
          
          {/* Decorative placeholder for image/avatar area */}
          <div className="absolute right-0 bottom-0 h-full w-1/2 hidden lg:flex items-end justify-center pointer-events-none">
             <div className="w-[70%] h-[85%] bg-gradient-to-t from-blue-100/50 to-transparent rounded-t-[100px]" />
          </div>
        </div>
      </div>

      {/* SECTION 2: THEMED FEATURE GRID (Dark Transition) */}
      <div className="py-32 mt-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-white mb-4">Core Ecosystem</h2>
            <p className="text-slate-400 text-lg">Powerful features designed to help you succeed at every stage.</p>
          </div>

          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({ feature }: { feature: Feature }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    gsap.to(card, {
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(6, 182, 212, 0.15), rgba(15, 23, 42, 0.9))`,
      duration: 0.3,
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      background: 'rgba(15, 23, 42, 0.8)',
      duration: 0.3,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative p-8 rounded-3xl border transition-all duration-500 hover:-translate-y-2 overflow-hidden ${
        feature.highlight
          ? 'bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/30 hover:border-cyan-500/50'
          : 'bg-slate-900/50 backdrop-blur-sm border-white/5 hover:border-cyan-500/30'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
      
      <div className="inline-flex p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
        {feature.icon}
      </div>

      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
        {feature.title}
      </h3>
      <p className="text-slate-400 leading-relaxed mb-6 group-hover:text-slate-300 transition-colors">
        {feature.description}
      </p>

      <div className="flex items-center gap-2 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-sm font-semibold">Learn more</span>
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </div>

      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
};