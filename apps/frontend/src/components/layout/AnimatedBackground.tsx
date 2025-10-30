"use client";
import React, { useState, useEffect } from 'react';
import { Menu, X, Search, ChevronRight, Play } from 'lucide-react';

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-cyan-200 pointer-events-none -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950"></div>
      <div className="absolute top-0 -left-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-sky-500 rounded-full mix-blend-screen blur-3xl opacity-35 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>
  );
}