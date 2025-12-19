"use client";
import Shell from '@/components/layout/Shell';
import BackButton from '@/components/navigation/BackButton';

interface MaterialLayoutProps {
  children: React.ReactNode;
}

export default function MaterialLayout({ children }: MaterialLayoutProps) {
  return (
    <Shell>
      <div className="flex justify-between">
        <BackButton 
          fallbackPath="/marketplace/materials"
        >
          Back to Materials
        </BackButton>
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </Shell>
  );
}
