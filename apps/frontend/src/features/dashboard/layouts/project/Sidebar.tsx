"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { projectMenuItems } from '../../constants';

export default function Sidebar({ mode = "inline", onClose }: { mode?: "inline" | "overlay"; onClose?: () => void }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'overview';

  const handleItemClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    const width = isCollapsed ? '4rem' : '16rem';
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--project-sidebar-width', width);
    }
  }, [isCollapsed]);

  return (
    <aside 
      className={`${isCollapsed ? 'w-16' : 'w-64'} ${mode === 'overlay' ? 'h-full' : ''} z-40 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 text-white transition-all duration-300 ease-in-out flex flex-col border-r border-cyan-900/20 shadow-xl`}
    >
      {/* Cyan accent line */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 via-cyan-400 to-blue-500 opacity-60"></div>
      
      {/* Header with Collapse Button */}
      <div className="p-4 border-b border-cyan-900/30 flex items-center justify-between bg-slate-800/50">
        {!isCollapsed && (
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Project Menu
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-cyan-900/30 transition-colors border border-transparent hover:border-cyan-700/50"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <div className="space-y-1.5">
          {projectMenuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.value;
            return (
              <button
                key={item.value}
                onClick={() => handleItemClick(item.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/50' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-cyan-400'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                {isActive && <div className="absolute left-0 w-1 h-full bg-white rounded-r"></div>}
                <IconComponent size={20} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

