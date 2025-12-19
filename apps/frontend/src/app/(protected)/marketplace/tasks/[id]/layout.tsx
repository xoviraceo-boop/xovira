"use client";
import Shell from '@/components/layout/Shell';
import BackButton from '@/components/navigation/BackButton';

interface TaskLayoutProps {
  children: React.ReactNode;
}

export default function TaskLayout({ children }: TaskLayoutProps) {
  return (
    <Shell>
      <div className="flex justify-between">
        <BackButton fallbackPath="/marketplace/tasks">Back to Tasks</BackButton>
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </Shell>
  );
}

