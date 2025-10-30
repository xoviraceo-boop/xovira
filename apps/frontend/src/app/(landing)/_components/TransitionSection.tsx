"use client";
import React from "react";
import { motion } from "framer-motion";
import EntangledStringEffect from "./EntangledStringEffect";

export const TransitionSection = () => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  return (
    // ✅ Outer wrapper with padding and ref
    <div ref={parentRef} className="relative w-full pt-32">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-[360px] w-full flex items-center justify-center overflow-hidden rounded-b-3xl"
      >
        {/* Background animation effect */}
        <EntangledStringEffect ref={parentRef} />

        {/* Glowing backdrop card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
          className="absolute -mt-1 flex flex-col items-center justify-center 
                     rounded-3xl border border-cyan-400/30 
                     bg-white/5 backdrop-blur-xl 
                     shadow-[0_0_40px_-5px_rgba(34,211,238,0.6)] 
                     px-6 py-4"
        >
          {/* Title */}
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.6, type: "spring" }}
            className="text-center text-transparent bg-clip-text 
                       bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-400 
                       text-4xl font-extrabold tracking-wide drop-shadow-lg"
          >
            Connect
          </motion.h2>

          {/* Subtitle / Tagline */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="mt-2 text-center text-cyan-100/70 text-base font-medium"
          >
            Where mentors, teams, and investors meet
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};
