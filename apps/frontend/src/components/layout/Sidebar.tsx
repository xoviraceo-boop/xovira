"use client";
import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { 
  Home, 
  LayoutDashboard, 
  Store, 
  Users, 
  FolderOpen, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  LogOut,
  Filter,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  X
} from 'lucide-react';

const mainNav = [
  { label: "Home", href: "/", icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Marketplace", href: "/marketplace", icon: Store },
];

const secondaryNav = [
  { label: "Teams", href: "/dashboard/teams", icon: Users },
  { label: "Projects", href: "/dashboard/projects", icon: FolderOpen },
  { label: "Proposals", href: "/dashboard/proposals", icon: FileText },
];

export default function MainSidebar({ mode = "inline", onClose }: { mode?: "inline" | "overlay"; onClose?: () => void }) {
  const [isMainCollapsed, setIsMainCollapsed] = useState(false);
  const { data: session } = useSession();
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("/marketplace");
  const [selectedIndustries, setSelectedIndustries] = useState(["AI / ML"]);
  const [selectedStages, setSelectedStages] = useState(["Seed"]);
  const [fundingRange, setFundingRange] = useState([0, 500000]);

  const industries = ["AI / ML", "Fintech", "Healthcare", "Education"];
  const stages = ["Pre-Seed", "Seed", "Series A", "Series B", "Growth"];

  const handleItemClick = (href: string) => {
    setActiveItem(href);
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry) 
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const toggleStage = (stage: string) => {
    setSelectedStages(prev => 
      prev.includes(stage) 
        ? prev.filter(s => s !== stage)
        : [...prev, stage]
    );
  };

  const Aside = (
    <aside 
      className={`${isMainCollapsed ? 'w-16' : 'w-64'} ${mode === 'overlay' ? 'h-full' : ''} z-50 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 text-white transition-all duration-300 ease-in-out flex flex-col border-r border-cyan-900/20 shadow-xl`}
      onTransitionEnd={() => {
        const width = isMainCollapsed ? '4rem' : '16rem';
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--main-sidebar-width', width);
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sidebar:main-collapsed', { detail: { collapsed: isMainCollapsed, width } }));
        }
      }}
    >
      {/* Cyan accent line */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 via-cyan-400 to-blue-500 opacity-60"></div>
      
      {/* Header with Collapse Button */}
      <div className="p-4 border-b border-cyan-900/30 flex items-center justify-between bg-slate-800/50">
        {!isMainCollapsed && (
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Navigation
          </h2>
        )}
        <div className="flex items-center gap-2">
          {mode === 'overlay' && (
            <button
              aria-label="Close sidebar"
              onClick={() => {
                if (onClose) onClose();
              }}
              className="p-1.5 rounded-lg border border-cyan-700/50 hover:bg-cyan-900/30 hover:border-cyan-600 transition-all"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={() => {
              const next = !isMainCollapsed;
              setIsMainCollapsed(next);
              const width = next ? '4rem' : '16rem';
              if (typeof document !== 'undefined') {
                document.documentElement.style.setProperty('--main-sidebar-width', width);
              }
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('sidebar:main-collapsed', { detail: { collapsed: next, width } }));
              }
            }}
            className="p-1.5 rounded-lg hover:bg-cyan-900/30 transition-colors border border-transparent hover:border-cyan-700/50"
          >
            {isMainCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`flex-1 p-4 overflow-y-auto ${
            isMainCollapsed 
              ? 'p-2' 
              : 'p-4'
          }`}>
        <div className="space-y-1.5">
          {mainNav.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeItem === item.href;
            return (
              <button
                key={item.href}
                onClick={() => handleItemClick(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/50' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-cyan-400'
                }`}
                title={isMainCollapsed ? item.label : ''}
              >
                {isActive && <div className="absolute left-0 w-1 h-full bg-white rounded-r"></div>}
                <IconComponent size={20} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
                {!isMainCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {!isMainCollapsed && (
          <>
            <div className="mt-6 pt-4 border-t border-cyan-900/30">
              <p className="text-xs font-semibold text-cyan-400 mb-3 px-1">SHORTCUTS</p>
              <div className="space-y-1">
                {secondaryNav.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeItem === item.href;
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleItemClick(item.href)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${
                        isActive 
                          ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-700/50' 
                          : 'text-slate-400 hover:bg-slate-700/50 hover:text-cyan-300'
                      }`}
                    >
                      <IconComponent size={16} className="group-hover:scale-110 transition-transform" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* User Profile and Logout */}
      <div className="p-4 border-t border-cyan-900/30 bg-slate-800/50">
        {!isMainCollapsed ? (
          <div className="space-y-2">
            <button 
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-cyan-900/30 hover:text-cyan-400 transition-all border border-transparent hover:border-cyan-700/50 group" 
              onClick={() => { if (typeof window !== 'undefined') window.location.href = '/dashboard/my-profile'; }}
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                {session?.user?.name?.charAt(0).toUpperCase() || <User size={18} />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold truncate">{session?.user?.name || 'My Profile'}</p>
                <p className="text-xs text-slate-500 truncate">{session?.user?.email || ''}</p>
              </div>
            </button>
            <button 
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-red-900/20 hover:text-red-400 transition-all border border-transparent hover:border-red-700/50" 
              onClick={() => signOut()}
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button 
              className="w-full flex justify-center p-2.5 rounded-xl text-slate-300 hover:bg-cyan-900/30 hover:text-cyan-400 transition-all border border-transparent hover:border-cyan-700/50"
              title="Profile"
              onClick={() => { if (typeof window !== 'undefined') window.location.href = '/dashboard/my-profile'; }}
            >
              <User size={20} />
            </button>
            <button 
              className="w-full flex justify-center p-2.5 rounded-xl text-slate-300 hover:bg-red-900/20 hover:text-red-400 transition-all border border-transparent hover:border-red-700/50"
              title="Logout"
              onClick={() => signOut()}
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );

  return Aside;
}