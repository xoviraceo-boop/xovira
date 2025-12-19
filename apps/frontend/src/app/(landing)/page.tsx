"use client";
import { 
  Navigation, 
  HeroSection, 
  PreviewSection,
  FeatureSection, 
  MarketplaceBrowser, 
  HowItWorksSection,
  StatsSection,
  TestimonialsSection,
  CTASection, 
  Footer 
} from "./_components";
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <AnimatedBackground />
      <Navigation />
      <HeroSection />
      <PreviewSection />
      <FeatureSection />
      <StatsSection />
      <MarketplaceBrowser />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};
