"use client";
import { 
  Navigation, 
  HeroSection, 
  FeatureSection, 
  MarketplaceBrowser, 
  HowItWorksSection, 
  TransitionSection,
  CTASection, 
  Footer 
} from "./_components";
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen text-white">
      <AnimatedBackground />
      <Navigation />
      <HeroSection />
      <FeatureSection />
      <TransitionSection />
      <MarketplaceBrowser />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
};

