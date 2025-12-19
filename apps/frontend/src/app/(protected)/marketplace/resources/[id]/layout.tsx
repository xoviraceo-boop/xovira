"use client";
import Shell from '@/components/layout/Shell';
import BackButton from '@/components/navigation/BackButton';

interface ResourceLayoutProps {
  children: React.ReactNode;
}

export default function ResourceLayout({ children }: ResourceLayoutProps) {
  return (
    <Shell>
      <div className="flex justify-between">
        <BackButton fallbackPath="/marketplace/resources">Back to Resources</BackButton>
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </Shell>
  );
}

