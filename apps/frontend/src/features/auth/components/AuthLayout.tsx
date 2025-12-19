import React from 'react';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';
import { Mail, Lock, User, Send, ChevronLeft } from 'lucide-react';
import { Testimonials } from './Testimonials';

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    
    // Consistent background styling for both mobile and desktop panels
    const backgroundStyle = {
        background: 'linear-gradient(145deg, rgba(30, 0, 60, 0.9), rgba(60, 20, 100, 0.9)), url(https://placehold.co/1000x1200/2C0054/8040A0?text=Capturing+Moments)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    const ImagePanelContent = (
        <>
            <Testimonials />
        </>
    );

    return (
        // Full screen wrapper: Centers content, provides a light background for padding
        <div className="min-h-screen font-sans flex items-center justify-center relative p-0 sm:p-4">
            <AnimatedBackground />
            {/* Mobile Background: Fixed position, full-screen image layer for small screens */}
            {/* This layer provides the background when the form card overlays the image on mobile */}
            <div 
                className="fixed inset-0 z-0 lg:hidden" // Fixed background on mobile, hidden on desktop
                style={backgroundStyle}
            />
            
            {/* Main Content Card: Centered and responsive, relative to be on top of the fixed background */}
            <div className="relative z-20 w-full max-w-7xl h-full rounded-none py-10 lg:rounded-2xl shadow-none overflow-hidden transition-all duration-500 flex flex-col lg:flex-row min-h-screen lg:min-h-0">
                
                {/* 1. Desktop Left Panel (Image) */}
                <div 
                    className="hidden lg:block lg:w-1/2 p-10 relative overflow-hidden rounded-l-2xl"
                    style={{...backgroundStyle, boxShadow: 'inset -2px 0 10px rgba(0, 0, 0, 0.3)'}}
                >
                    {ImagePanelContent}
                </div>
                
                {/* 2. Form Panel (AuthContainer content) */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-0 sm:p-10 z-20">
                    {/* The children (LoginView/RegisterView) contains AuthContainer which is the white card */}
                    {children} 
                </div>
            </div>
        </div>
    );
};