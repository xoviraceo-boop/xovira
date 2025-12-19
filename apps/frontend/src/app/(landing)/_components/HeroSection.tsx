"use client";
import React, { useEffect, useRef } from 'react';
import { ArrowRight, Play, Sparkles, MousePointer2 } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const visualsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      // 1. Entrance Sequence
      tl.from(".bg-grid", { opacity: 0, duration: 2 })
        .from(".hero-badge", { y: 20, opacity: 0, duration: 0.8 }, "-=1.5")
        .from(".word-reveal", { 
          y: 110, 
          rotationZ: 5, 
          stagger: 0.08, 
          duration: 1.2 
        }, "-=1.2")
        .from(".hero-desc", { y: 20, opacity: 0, duration: 0.8 }, "-=0.8")
        .from(".hero-cta", { scale: 0.9, opacity: 0, duration: 0.8 }, "-=0.6")
        .from(".stat-item", { y: 20, opacity: 0, stagger: 0.1 }, "-=0.4");

      // 2. Parallax & Scroll Effects
      gsap.to(".parallax-element", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        },
        y: (i, target) => target.dataset.speed * 100,
        ease: "none"
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden flex flex-col justify-center pb-4"
    >
      {/* --- PREMIUUM BACKGROUND LAYER --- */}
      {/* 1. Subtle Grid System */}
      <div className="bg-grid absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]">
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* 2. Grain Overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* 3. Custom Glows (Moving away from circles to "beams") */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-teal-500/10 blur-[100px] rounded-full" />

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 container mx-auto px-6 pt-20">
        <div className="flex flex-col items-center text-center">
          
          {/* Enhanced Badge */}
          <div className="hero-badge flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-[0.2em] text-cyan-400 font-bold mb-10 backdrop-blur-md">
            <Sparkles size={12} />
            The Future of Networking
          </div>

          {/* High-End Masked Typography */}
          <h1 ref={titleRef} className="max-w-5xl mb-8">
            <span className="block overflow-hidden pb-2">
              <span className="word-reveal block text-5xl md:text-8xl font-medium tracking-tight text-white leading-[0.95]">
                Design the <span className="italic font-light text-cyan-300">impossible</span>
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="word-reveal block text-5xl md:text-8xl font-medium tracking-tight text-white leading-[0.95]">
                with <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-gray-500">ConnectHub</span>
              </span>
            </span>
          </h1>

          {/* Subtitle with better measure (max-width) */}
          <p className="hero-desc text-lg md:text-xl text-gray-400 max-w-2xl mb-12 font-light leading-relaxed">
            A boutique ecosystem for high-stakes collaboration. We bridge the gap between 
            visionary capital and elite execution.
          </p>

          {/* CTA Group */}
          <div className="hero-cta flex flex-col sm:flex-row items-center gap-6">
            <a href="/signup" className="group relative px-10 py-5 bg-white text-black rounded-full font-bold overflow-hidden transition-transform hover:scale-105 active:scale-95">
              <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                Sign Up <ArrowRight size={18} />
              </span>
            </a>
            
            <a href="/login" className="flex items-center gap-3 text-white font-medium hover:text-cyan-400 transition-colors group">
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-cyan-400/50">
                <Play size={16} fill="white" className="ml-1" />
              </div>
              Sign In
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};