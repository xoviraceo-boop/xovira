"use client";
import React, { useState, useEffect } from 'react';
import { Menu, X, Search, ChevronRight, Play } from 'lucide-react';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'py-2' 
        : 'py-4'
    }`}>
      <div className={`max-w-7xl mx-auto transition-all duration-500 px-4 sm:px-6 lg:px-8`}>
        <div className={`transition-all duration-500 ${
          isScrolled 
            ? 'bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-lg shadow-cyan-500/10' 
            : 'bg-transparent border-cyan-500'
        } px-6`}>
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
              ConnectHub
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-cyan-400 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-cyan-400 transition-colors">How It Works</a>
              <a href="#projects" className="text-gray-300 hover:text-cyan-400 transition-colors">Projects</a>
              <button className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full font-semibold text-slate-900 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                Get Started Free
              </button>
            </div>

            <button 
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 animate-[fadeIn] [animation-duration:0.6s] [animation-timing-function:ease-out]">
              <a href="#features" className="block text-gray-300 hover:text-cyan-400 transition-colors py-2">Features</a>
              <a href="#how-it-works" className="block text-gray-300 hover:text-cyan-400 transition-colors py-2">How It Works</a>
              <a href="#projects" className="block text-gray-300 hover:text-cyan-400 transition-colors py-2">Projects</a>
              <button className="w-full px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full font-semibold text-slate-900 mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                Get Started Free
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
