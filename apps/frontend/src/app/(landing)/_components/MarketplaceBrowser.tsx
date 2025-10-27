"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Search, ChevronRight, Play } from 'lucide-react';

export const MarketplaceBrowser = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [flippedCards, setFlippedCards] = useState<boolean[]>([false, false, false, false, false, false]);
  const [cycleCount, setCycleCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const placeholderText = "Search projects, skills, or opportunities...";
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const categories = [
    { name: 'Industries', icon: '🏭' },
    { name: 'Professions', icon: '💼' },
    { name: 'Businesses', icon: '🏢' },
    { name: 'Teams', icon: '👥' },
    { name: 'Positions', icon: '📍' },
    { name: 'More', icon: '➕' },
  ];

  // Scroll-triggered card flip effect
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || hasAnimated) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight * 0.75 && rect.bottom > 0;
      
      if (isVisible) {
        setHasAnimated(true);
        categories.forEach((_, index) => {
          setTimeout(() => {
            setFlippedCards(prev => {
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
          }, index * 150);
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasAnimated]);

  // Infinite typing, loading, and results cycle
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
    <section ref={sectionRef} className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Browse To Find Endless{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
              Opportunities
            </span>
          </h2>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Span Across Cards */}
          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-cyan-500/10">
            <h3 className="text-2xl font-bold text-cyan-400 mb-6">Span across</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories.map((item, i) => (
                <div 
                  key={i}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-center font-semibold text-lg bg-gradient-to-br from-cyan-500/20 to-slate-800/50 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 [transform-style:preserve-3d]`}
                  style={{
                    animationName: flippedCards[i] ? 'flipInFromTop' : 'none',
                    animationDuration: '0.6s',
                    animationTimingFunction: 'ease-out',
                    animationFillMode: 'forwards',
                    animationDelay: flippedCards[i] ? `${i * 150}ms` : '0ms',
                    opacity: flippedCards[i] ? 1 : 0,
                    transform: flippedCards[i] ? 'none' : 'perspective(400px) rotateX(-90deg)',
                  }}
                >

                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div>{item.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Marketplace Browser */}
          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-cyan-500/10">
            <h3 className="text-2xl font-bold text-cyan-400 mb-6">Marketplace Browser</h3>
            
            <div className="mb-6">
              <div className="flex items-center gap-3 bg-slate-900/50 p-4 rounded-xl border border-cyan-500/20">
                <Search size={20} className="text-cyan-400" />
                <input
                  type="text"
                  value={displayText}
                  readOnly
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
                  placeholder={!displayText ? "Type to search..." : ""}
                />
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-lg font-semibold text-sm text-slate-900 hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isTyping}
                >
                  Search
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                  <p className="text-cyan-400 text-sm">Searching marketplace...</p>
                </div>
              </div>
            )}

            {/* Skeleton Results */}
            {showResults && (
              <div className="grid grid-cols-2 gap-3" key={cycleCount}>
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="bg-slate-900/50 p-4 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
                    style={{ 
                      animation: `fadeInUp 0.6s ease-out forwards`,
                      animationDelay: `${i * 100}ms`,
                      opacity: 0,
                    }}
                  >
                    <div className="h-16 bg-gradient-to-br from-cyan-500/20 to-slate-800 rounded-lg mb-3 animate-pulse"></div>
                    <div className="h-4 bg-cyan-500/20 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-slate-700/50 rounded w-full mb-2 animate-pulse"></div>
                    <div className="h-3 bg-slate-700/50 rounded w-2/3 animate-pulse"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state when not loading or showing results */}
            {!isLoading && !showResults && (
              <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
                Start typing to search...
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};