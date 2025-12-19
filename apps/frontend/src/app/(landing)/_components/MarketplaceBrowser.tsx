"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, Briefcase, Users, MapPin, MoreHorizontal, ArrowRight, TrendingUp } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const MarketplaceBrowser = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const placeholderText = "Search projects, skills, or opportunities...";
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const categories = [
    { name: 'Industries', icon: Building2, color: 'from-purple-500 to-purple-600' },
    { name: 'Professions', icon: Briefcase, color: 'from-cyan-500 to-cyan-600' },
    { name: 'Businesses', icon: Building2, color: 'from-teal-500 to-teal-600' },
    { name: 'Teams', icon: Users, color: 'from-blue-500 to-blue-600' },
    { name: 'Positions', icon: MapPin, color: 'from-indigo-500 to-indigo-600' },
    { name: 'More', icon: MoreHorizontal, color: 'from-gray-500 to-gray-600' },
  ];

  const sampleProjects = [
    { title: 'AI-Powered Analytics Platform', category: 'Technology', trending: true },
    { title: 'Sustainable Energy Solution', category: 'Energy', trending: false },
    { title: 'Healthcare Innovation Hub', category: 'Healthcare', trending: true },
    { title: 'FinTech Payment Gateway', category: 'Finance', trending: false },
  ];

  // Scroll-triggered animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!hasAnimated && sectionRef.current) {
        gsap.fromTo('.category-card',
          { opacity: 0, scale: 0.8, rotation: -5 },
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse'
            }
          }
        );
        setHasAnimated(true);
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  // Typing animation cycle
  useEffect(() => {
    if (isTyping && currentIndex < placeholderText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(placeholderText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else if (currentIndex >= placeholderText.length && isTyping) {
      setTimeout(() => {
        setIsTyping(false);
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          setShowResults(true);
          setTimeout(() => {
            setShowResults(false);
            setDisplayText('');
            setCurrentIndex(0);
            setIsTyping(true);
            setCycleCount(prev => prev + 1);
          }, 3000);
        }, 2000);
      }, 500);
    }
  }, [currentIndex, isTyping, placeholderText.length]);

  return (
    <section 
      ref={sectionRef} 
      id="marketplace"
      className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
            Browse To Find Endless{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Opportunities
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover projects, connect with teams, and explore opportunities across industries
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Categories Grid */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Explore Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="category-card group relative p-6 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/20 cursor-pointer overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    <div className="relative z-10 flex flex-col items-center justify-center text-center">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <div className="text-sm font-semibold text-white">{item.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Marketplace Browser */}
          <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-cyan-500/10">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Search size={24} className="text-cyan-400" />
              Marketplace Browser
            </h3>
            
            {/* Search Input */}
            <div className="mb-6">
              <div className="relative flex items-center gap-3 bg-slate-800/50 p-4 rounded-xl border border-cyan-500/20 focus-within:border-cyan-500/50 transition-colors">
                <Search size={20} className="text-cyan-400 flex-shrink-0" />
                <input
                  type="text"
                  value={displayText}
                  readOnly
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm"
                  placeholder={!displayText ? "Type to search..." : ""}
                />
                {displayText && (
                  <div className="flex-shrink-0 w-2 h-5 bg-cyan-400 animate-pulse" />
                )}
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-lg font-semibold text-sm text-slate-900 hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isTyping}
                >
                  Search
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                  <p className="text-cyan-400 text-sm font-medium">Searching marketplace...</p>
                </div>
              </div>
            )}

            {/* Results */}
            {showResults && (
              <div className="space-y-3" key={cycleCount}>
                {sampleProjects.map((project, i) => (
                  <div
                    key={i}
                    className="p-4 bg-slate-800/50 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-slate-800/70 transition-all duration-300 group cursor-pointer"
                    style={{ 
                      animation: `fadeInUp 0.4s ease-out forwards`,
                      animationDelay: `${i * 100}ms`,
                      opacity: 0
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-semibold group-hover:text-cyan-300 transition-colors">
                            {project.title}
                          </h4>
                          {project.trending && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-full">
                              <TrendingUp size={12} />
                              Trending
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{project.category}</p>
                      </div>
                      <ArrowRight size={20} className="text-gray-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !showResults && (
              <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
                Start typing to search the marketplace...
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
