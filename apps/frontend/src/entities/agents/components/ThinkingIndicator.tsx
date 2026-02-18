import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, BrainCircuit, MessageSquare, Cog, CheckCircle2 } from 'lucide-react';

interface ThinkingIndicatorProps {
    stage?: string;
    className?: string;
}

const THINKING_STEPS = [
    { text: 'Analyzing request...', icon: MessageSquare, duration: 1500 },
    { text: 'Checking context...', icon: BrainCircuit, duration: 1500 },
    { text: 'Inferring automations...', icon: Sparkles, duration: 2000 },
    { text: 'Configuring agent...', icon: Cog, duration: 1500 },
    { text: 'Finalizing response...', icon: CheckCircle2, duration: 1000 },
];

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
    stage,
    className
}) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        // Reset when component mounts or stage changes
        setCurrentStepIndex(0);

        let timeoutId: NodeJS.Timeout;

        const advanceStep = () => {
            setCurrentStepIndex((prev) => {
                const next = prev + 1;
                if (next < THINKING_STEPS.length) {
                    timeoutId = setTimeout(advanceStep, THINKING_STEPS[next].duration);
                    return next;
                }
                // Loop back to the middle steps if it takes too long, but keep it dynamic
                timeoutId = setTimeout(() => setCurrentStepIndex(1), 1000);
                return prev;
            });
        };

        // Start the cycle
        timeoutId = setTimeout(advanceStep, THINKING_STEPS[0].duration);

        return () => clearTimeout(timeoutId);
    }, [stage]);

    const CurrentIcon = THINKING_STEPS[currentStepIndex].icon;

    return (
        <div className={cn("flex items-center gap-3 py-2 px-1 text-muted-foreground animate-pulse", className)}>
            <div className="relative">
                <CurrentIcon className="h-4 w-4 animate-bounce" />
                <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full animate-ping" />
            </div>
            <span className="text-sm font-medium tracking-tight">
                {THINKING_STEPS[currentStepIndex].text}
            </span>
        </div>
    );
};
