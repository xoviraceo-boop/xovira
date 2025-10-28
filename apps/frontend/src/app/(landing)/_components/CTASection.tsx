"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Search, ChevronRight, Play } from 'lucide-react';

export const CTASection = () => {
  const parentDivRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parentDiv = parentDivRef.current;
    const blob = blobRef.current;

    const onMouseMove = (e: MouseEvent) => {
      if (parentDiv && blob) {
        const rect = parentDiv.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        blob.style.left = `${x}px`;
        blob.style.top = `${y}px`;
      }
    };

    const handleMouseEnter = () => {
      if (blob) {
        blob.style.opacity = "1";
      }
    };

    const handleMouseLeave = () => {
      if (blob) {
        blob.style.opacity = "0";
      }
    };

    if (parentDiv) {
      parentDiv.addEventListener('mouseenter', handleMouseEnter);
      parentDiv.addEventListener('mouseleave', handleMouseLeave);
      parentDiv.addEventListener("mousemove", onMouseMove);
    }

    return () => {
      if (parentDiv) {
        parentDiv.removeEventListener('mouseenter', handleMouseEnter);
        parentDiv.removeEventListener('mouseleave', handleMouseLeave);
        parentDiv.removeEventListener("mousemove", onMouseMove);
      }
    };
  }, []);

  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div ref={parentDivRef} className="max-w-5xl mx-auto relative">
        <div
          ref={blobRef}
          className="absolute pointer-events-none w-64 h-64 rounded-full -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.6) 0%, rgba(8, 145, 178, 0.4) 30%, transparent 70%)',
            filter: 'blur(40px)',
            opacity: 80,
            zIndex: 10,
          }}
        ></div>

        <div className="relative bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-400 rounded-3xl p-1 overflow-hidden" style={{ zIndex: 2 }}>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-400 opacity-50 blur-xl"></div>
          
          <div className="relative bg-slate-900 rounded-3xl p-8 sm:p-12 md:p-16">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                Find Your{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
                  Perfect Match
                </span>
              </h2>
              
              <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of innovators, investors, and professionals already building the future on ConnectHub. 
                Start your journey today—completely free.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <button className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 rounded-full font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2">
                  Get Started for Free
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

