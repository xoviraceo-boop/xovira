"use client";
import React, { useRef, useEffect } from 'react';
import { UserPlus, Search, Handshake, Rocket, CheckCircle2, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Your Profile',
    description: 'Sign up and build your professional profile. Showcase your skills, experience, and what you\'re looking for.',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    number: '02',
    icon: Search,
    title: 'Explore Opportunities',
    description: 'Browse through thousands of projects, teams, and opportunities. Use smart filters to find exactly what you need.',
    color: 'from-teal-500 to-teal-600'
  },
  {
    number: '03',
    icon: Handshake,
    title: 'Connect & Collaborate',
    description: 'Reach out to potential partners, investors, or team members. Start meaningful conversations and build relationships.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    number: '04',
    icon: Rocket,
    title: 'Launch & Grow',
    description: 'Turn your ideas into reality. With the right team and resources, launch your project and scale your business.',
    color: 'from-purple-500 to-purple-600'
  },
];

export const HowItWorksSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate steps
      const stepElements = stepsRef.current?.children;
      if (stepElements) {
        Array.from(stepElements).forEach((step, index) => {
          gsap.fromTo(step,
            {
              opacity: 0,
              y: 60,
              scale: 0.9
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: step,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              },
              delay: index * 0.15
            }
          );
        });
      }

      // Animate connecting lines
      gsap.fromTo('.connecting-line',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse'
          },
          stagger: 0.2
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      id="how-it-works" 
      ref={sectionRef}
      className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-300 mb-6 backdrop-blur-sm">
            Simple Process
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
            From Sign-Up to{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Success
            </span>
            {' '}in Four Steps
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get started in minutes and unlock endless opportunities
          </p>
        </div>

        {/* Steps Grid */}
        <div ref={stepsRef} className="relative">
          {/* Desktop: Horizontal Layout */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;
              
              return (
                <React.Fragment key={index}>
                  <div className="relative">
                    {/* Step Card */}
                    <div className="group relative p-8 bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20">
                      {/* Number Badge */}
                      <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {step.number}
                      </div>

                      {/* Icon */}
                      <div className={`inline-flex p-4 bg-gradient-to-br ${step.color} rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                        <Icon size={32} className="text-white" />
                      </div>

                      {/* Content */}
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                        {step.description}
                      </p>

                      {/* Checkmark on hover */}
                      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <CheckCircle2 size={24} className="text-cyan-400" />
                      </div>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full -translate-y-1/2 z-0">
                      <div className="connecting-line h-0.5 bg-gradient-to-r from-cyan-500/50 via-teal-500/50 to-blue-500/50 transform origin-left" 
                        style={{ width: 'calc(100% + 2rem)', marginLeft: '50%' }}
                      />
                      <ArrowRight 
                        size={24} 
                        className="absolute top-1/2 right-0 -translate-y-1/2 text-cyan-400"
                        style={{ transform: 'translate(50%, -50%)' }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile/Tablet: Vertical Layout */}
          <div className="lg:hidden space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Step Card */}
                  <div className="group relative p-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      {/* Number and Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex flex-col items-center justify-center mb-4">
                          <div className="text-white font-bold text-xs">{step.number}</div>
                          <Icon size={20} className="text-white mt-1" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Arrow down (except last) */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center my-4">
                      <ArrowRight size={24} className="text-cyan-400 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full font-semibold text-slate-900 hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:-translate-y-1 flex items-center gap-2 mx-auto">
            Get Started Free
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
