"use client";

import React from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export const PreviewSection = () => {
  const tabs = [
    { value: "workspace", label: "Workspace", img: "/images/preview-1.png" },
    { value: "space", label: "Space", img: "/images/preview-2.png" },
    { value: "project", label: "Project", img: "/images/preview-3.png" },
    { value: "team", label: "Team", img: "/images/preview-4.png" },
    { value: "proposal", label: "Proposal", img: "/images/preview-5.png" },
  ];

  return (
    /* Outer Wrapper: Adds the necessary spacing and theme-matching background */
    <div className="relative w-full min-h-screen py-24 px-4 sm:px-10 lg:px-20 overflow-hidden">

      {/* --- TOP DIVIDER (Linear Gradient Blur) --- */}
      <div className="absolute top-0 left-0 w-full flex justify-center">
        <div className="top-divider w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent [mask-image:radial-gradient(ellipse_50%_100%_at_50%_50%,#000_30%,transparent_100%)]" />
      </div>
      
      {/* Background Spotlight Effect to match your Canvas theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto flex flex-col items-center">
        <Tabs defaultValue="workspace" className="w-full flex flex-col items-center">
          
          {/* Animated Border Wrapper for Tabs */}
          <div className="relative group p-[1px] rounded-full mb-16 shadow-2xl shadow-sky-500/20">
            {/* The Moving Border Effect */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0,transparent_30%,#38bdf8_50%,transparent_70%,transparent_100%)] opacity-40"
            />
            
            {/* Tab Navigation Bar */}
            <TabsList className="relative flex h-14 items-center justify-center rounded-full bg-[#0f172a]/90 backdrop-blur-2xl px-1.5 border border-white/5">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-full px-6 lg:px-10 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 transition-all 
                             data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-lg"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Image Display Area */}
          {/* Image Display Area */}
          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="relative w-full mt-0 focus-visible:outline-none"
            >
              {/* --- NEW: Animated Border Wrapper for Content --- */}
              <div className="relative group p-[1px] rounded-[2rem] overflow-hidden">
                {/* Moving Border Effect (Matching the tab bar) */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0,transparent_30%,#38bdf8_50%,transparent_70%,transparent_100%)] opacity-40"
                />

                {/* Main Content Body */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative rounded-[2rem] bg-slate-900/90 p-1 shadow-2xl backdrop-blur-md overflow-hidden"
                >
                  {/* Internal Image Container */}
                  <div className="aspect-[16/9] relative rounded-[1.5rem] overflow-hidden bg-[#020617]">
                    <Image
                      src={tab.img}
                      alt={tab.label}
                      fill
                      priority
                      className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    {/* Top inner-glow glass effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                  </div>
                </motion.div>
              </div>

              {/* Secondary Glow behind the content for depth */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-sky-500/20 blur-[80px] -z-10" />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

