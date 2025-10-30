"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight, Play } from 'lucide-react';

const FlowFieldBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);
  const timeRef = useRef(0);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    // Helper functions
    const rand = (v1: number, v2: number) => Math.floor(v1 + Math.random() * (v2 - v1));

    // Options - adjusted for cyan theme
    const opt = {
      particles: window.innerWidth / 500 > 1 ? 1000 : 500,
      noiseScale: 0.009,
      angle: Math.PI / 180 * -90,
      h1: 180, // Cyan
      h2: 200, // Blue-cyan
      s1: 70,
      s2: 80,
      l1: 45,
      l2: 55,
      strokeWeight: 1.2,
      tail: 96,
    };

    // Simple noise function (using multiple sin waves for better Perlin-like noise)
    const noise = (x: number, y: number, z: number) => {
      const X = Math.sin(x * 0.1 + z * 0.1) * Math.cos(y * 0.1);
      const Y = Math.sin(y * 0.1 + z * 0.1) * Math.cos(x * 0.1);
      const Z = Math.sin(z * 0.1) * Math.cos(x * 0.1 + y * 0.1);
      return (X + Y + Z) / 3;
    };

    // Particle class
    class Particle {
      x: number;
      y: number;
      lx: number;
      ly: number;
      vx: number;
      vy: number;
      ax: number;
      ay: number;
      hueSeed: number;
      hue: number;
      sat: number;
      light: number;
      maxSpeed: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.lx = x;
        this.ly = y;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.hueSeed = Math.random();
        this.hue = this.hueSeed > 0.5 ? 20 + opt.h1 : 20 + opt.h2;
        this.sat = this.hueSeed > 0.5 ? opt.s1 : opt.s2;
        this.light = this.hueSeed > 0.5 ? opt.l1 : opt.l2;
        this.maxSpeed = this.hueSeed > 0.5 ? 3 : 2;
      }

      randomize() {
        this.hueSeed = Math.random();
        this.hue = this.hueSeed > 0.5 ? 20 + opt.h1 : 20 + opt.h2;
        this.sat = this.hueSeed > 0.5 ? opt.s1 : opt.s2;
        this.light = this.hueSeed > 0.5 ? opt.l1 : opt.l2;
        this.maxSpeed = this.hueSeed > 0.5 ? 3 : 2;
      }

      follow(time: number) {
        const angle = noise(
          this.x * opt.noiseScale,
          this.y * opt.noiseScale,
          time * opt.noiseScale
        ) * Math.PI * 0.5 + opt.angle;

        this.ax += Math.cos(angle);
        this.ay += Math.sin(angle);
      }

      update(time: number, width: number, height: number) {
        this.follow(time);

        this.vx += this.ax;
        this.vy += this.ay;

        const p = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const a = Math.atan2(this.vy, this.vx);
        const m = Math.min(this.maxSpeed, p);
        this.vx = Math.cos(a) * m;
        this.vy = Math.sin(a) * m;

        this.x += this.vx;
        this.y += this.vy;
        this.ax = 0;
        this.ay = 0;

        this.edges(width, height);
      }

      updatePrev() {
        this.lx = this.x;
        this.ly = this.y;
      }

      edges(width: number, height: number) {
        if (this.x < 0) {
          this.x = width;
          this.updatePrev();
        }
        if (this.x > width) {
          this.x = 0;
          this.updatePrev();
        }
        if (this.y < 0) {
          this.y = height;
          this.updatePrev();
        }
        if (this.y > height) {
          this.y = 0;
          this.updatePrev();
        }
      }

      render(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, .5)`;
        ctx.beginPath();
        ctx.moveTo(this.lx, this.ly);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        this.updatePrev();
      }
    }

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < opt.particles; i++) {
        particlesRef.current.push(
          new Particle(Math.random() * canvas.width, Math.random() * canvas.height)
        );
      }
    };
    initParticles();

    // Click handler to randomize colors
    const handleClick = () => {
      opt.h1 = rand(160, 200); // Keep in cyan-blue range
      opt.h2 = rand(160, 200);
      opt.s1 = rand(60, 90);
      opt.s2 = rand(60, 90);
      opt.l1 = rand(40, 60);
      opt.l2 = rand(40, 60);
      opt.angle += (Math.PI / 180 * 60) * (Math.random() > 0.5 ? 1 : -1);

      for (const particle of particlesRef.current) {
        particle.randomize();
      }
    };

    canvas.addEventListener('click', handleClick);

    // Animation loop - FIXED
    const animate = () => {
      timeRef.current++;
    
      // Proper fade trail effect
      ctx.fillStyle = `rgba(0, 0, 0, ${1 / opt.tail})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    
      ctx.lineWidth = opt.strokeWeight;
    
      for (const particle of particlesRef.current) {
        particle.update(timeRef.current, canvas.width, canvas.height);
        particle.render(ctx);
      }
    
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize - FIXED
    const handleResize = () => {
      const oldWidth = canvas.width;
      const oldHeight = canvas.height;
      
      setCanvasSize();
      
      // Scale existing particles instead of reinitializing
      if (oldWidth > 0 && oldHeight > 0) {
        for (const particle of particlesRef.current) {
          particle.x = (particle.x / oldWidth) * canvas.width;
          particle.y = (particle.y / oldHeight) * canvas.height;
          particle.lx = (particle.lx / oldWidth) * canvas.width;
          particle.ly = (particle.ly / oldHeight) * canvas.height;
        }
      } else {
        // First load, initialize new particles
        initParticles();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleClick);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute -z-10 inset-0 overflow-hidden">
      {/* Canvas for flow field */}
      <canvas
        id="flow-field"
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-pointer mix-blend-screen pointer-events-auto"
      />
    </div>
  );
};

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 overflow-hidden">
      {/* Animated Background */}
      <FlowFieldBackground />
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-300 mb-8 backdrop-blur-sm animate-[fadeInDown] [animation-duration:0.8s] [animation-timing-function:ease-out]">
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
          Join the world of endless opportunities
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-[fadeInUp] [animation-duration:0.8s] [animation-timing-function:ease-out] text-white">
          Transform <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-200 bg-clip-text text-transparent">
            Ideas
          </span>
          <br />into <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-200 bg-clip-text text-transparent">
            Reality
          </span> Through
          <br />Powerful <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-200 bg-clip-text text-transparent">
            Collaboration
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed animate-[fadeInUp] [animation-duration:0.8s] [animation-timing-function:ease-out] [animation-delay:0.2s] opacity-0 [animation-fill-mode:forwards]">
          ConnectHub is the ultimate platform where innovators, investors, and talented professionals converge. 
          Discover groundbreaking projects, form high-performing teams, and turn your vision into successful ventures.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-[fadeInUp] [animation-duration:0.8s] [animation-timing-function:ease-out] [animation-delay:0.4s] opacity-0 [animation-fill-mode:forwards]">
          <button className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full font-semibold text-slate-900 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:-translate-y-1 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
            Start Collaborating
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-slate-800/50 border border-cyan-500/30 rounded-full font-semibold text-white hover:bg-slate-800/70 hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
            <Play size={20} />
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
};