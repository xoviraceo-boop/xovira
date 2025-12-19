"use client";
import React, { useRef, useEffect } from 'react';
import { ArrowRight, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const CTASection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate CTA on scroll
      gsap.fromTo(ctaRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Animate floating icons
      const icons = ctaRef.current?.querySelectorAll('.floating-icon');
      if (icons) {
        Array.from(icons).forEach((icon, index) => {
          gsap.to(icon, {
            y: `+=${30 + index * 10}`,
            rotation: `+=${5 + index * 2}`,
            duration: 3 + index,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: index * 0.3
          });
        });
      }

      // Mouse move blob effect
      const handleMouseMove = (e: MouseEvent) => {
        if (blobRef.current && ctaRef.current) {
          const rect = ctaRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          gsap.to(blobRef.current, {
            x: x,
            y: y,
            duration: 0.5,
            ease: 'power2.out'
          });
        }
      };

      if (ctaRef.current) {
        ctaRef.current.addEventListener('mousemove', handleMouseMove);
      }

      return () => {
        if (ctaRef.current) {
          ctaRef.current.removeEventListener('mousemove', handleMouseMove);
        }
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { icon: Users, value: '10K+', label: 'Active Users' },
    { icon: TrendingUp, value: '5K+', label: 'Projects' },
    { icon: Zap, value: '2K+', label: 'Success Stories' },
  ];

  return (
    <section ref={sectionRef} className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div 
          ref={ctaRef}
          className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-cyan-500/20 p-12 md:p-16 overflow-hidden group cursor-pointer"
        >
          {/* Animated blob background */}
          <div
            ref={blobRef}
            className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ left: '50%', top: '50%' }}
          />

          {/* Floating decorative icons */}
          <Sparkles className="floating-icon absolute top-8 left-8 text-cyan-400/20" size={32} />
          <TrendingUp className="floating-icon absolute top-12 right-12 text-teal-400/20" size={28} />
          <Users className="floating-icon absolute bottom-8 left-12 text-blue-400/20" size={24} />
          <Zap className="floating-icon absolute bottom-12 right-8 text-purple-400/20" size={30} />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5" />

          <div className="relative z-10">
            <div className="text-center mb-12">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-300 mb-6 backdrop-blur-sm">
                <Sparkles size={14} className="text-cyan-400" />
                <span>Join thousands of innovators</span>
              </div>

              {/* Title */}
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
                Ready to{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Transform
                </span>
                {' '}Your Ideas?
              </h2>

              {/* Description */}
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
                Join thousands of innovators, investors, and professionals already building the future on ConnectHub. 
                Start your journey today—completely free.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="inline-flex p-3 bg-cyan-500/10 rounded-xl text-cyan-400 mb-3">
                        <Icon size={20} />
                      </div>
                      <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2">
                  Get Started for Free
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-full font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm">
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Shine effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
};
