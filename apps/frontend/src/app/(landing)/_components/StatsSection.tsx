"use client";
import React, { useRef, useEffect, useState } from 'react';
import { Users, Briefcase, TrendingUp, Award, Target, Zap } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const stats = [
  { icon: Users, value: 10000, suffix: '+', label: 'Active Users', color: 'from-cyan-500 to-cyan-600' },
  { icon: Briefcase, value: 5000, suffix: '+', label: 'Active Projects', color: 'from-teal-500 to-teal-600' },
  { icon: TrendingUp, value: 2000, suffix: '+', label: 'Success Stories', color: 'from-blue-500 to-blue-600' },
  { icon: Award, value: 150, suffix: '+', label: 'Verified Investors', color: 'from-purple-500 to-purple-600' },
  { icon: Target, value: 95, suffix: '%', label: 'Success Rate', color: 'from-pink-500 to-pink-600' },
  { icon: Zap, value: 50, suffix: '+', label: 'Countries', color: 'from-orange-500 to-orange-600' },
];

export const StatsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [countedValues, setCountedValues] = useState(stats.map(() => 0));

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate stats counting
      stats.forEach((stat, index) => {
        const obj = { value: 0 };
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 75%',
          onEnter: () => {
            gsap.to(obj, {
              value: stat.value,
              duration: 2,
              ease: 'power2.out',
              onUpdate: () => {
                setCountedValues(prev => {
                  const newValues = [...prev];
                  newValues[index] = Math.floor(obj.value);
                  return newValues;
                });
              }
            });
          }
        });
      });

      // Animate cards
      const cards = sectionRef.current?.querySelectorAll('.stat-card');
      if (cards) {
        gsap.fromTo(cards,
          { opacity: 0, y: 40, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="stat-card group text-center p-6 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/20"
              >
                <div className={`inline-flex p-3 bg-gradient-to-br ${stat.color} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {countedValues[index]}{stat.suffix}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

