"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
      
      if (navRef.current) {
        gsap.to(navRef.current, {
          backgroundColor: scrolled ? 'rgba(15, 23, 42, 0.8)' : 'rgba(15, 23, 42, 0)',
          backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
          borderColor: scrolled ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0)',
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      gsap.fromTo('.mobile-menu-item', 
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.1 }
      );
    }
  }, [isMobileMenuOpen]);

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Marketplace', href: '#marketplace' },
    { name: 'Pricing', href: '#pricing' },
  ];

  return (
    <nav 
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{ padding: isScrolled ? '0.75rem 0' : '1.5rem 0' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="#" className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                ConnectHub
              </span>
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-300 hover:text-cyan-400 transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white transition-colors">
              Sign In
            </button>
            <button className="group px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full text-sm font-semibold text-slate-900 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2">
              Get Started
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-300 hover:text-white transition-colors p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-6 space-y-4 border-t border-white/10 mt-4">
            {navItems.map((item, index) => (
              <a
                key={item.name}
                href={item.href}
                className="mobile-menu-item block text-gray-300 hover:text-cyan-400 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-4 space-y-3 border-t border-white/10">
              <button className="mobile-menu-item w-full px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white transition-colors text-left">
                Sign In
              </button>
              <button className="mobile-menu-item w-full px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full text-sm font-semibold text-slate-900 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300">
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
