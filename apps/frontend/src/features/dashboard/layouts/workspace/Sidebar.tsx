"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WorkspaceSidebarProps {
  workspace?: {
    id: string;
    channels?: Array<{ id: string; name: string; description?: string | null }>;
    spaces?: Array<{ id: string; name: string; description?: string | null }>;
    teams?: Array<{ id: string; name: string; description?: string | null }>;
    projects?: Array<{ id: string; name: string; description?: string | null }>;
  } | null;
  mode?: "inline" | "overlay";
  onClose?: () => void;
}

export default function WorkspaceSidebar({ workspace, mode = "inline", onClose }: WorkspaceSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [spacesOpen, setSpacesOpen] = useState(true);
  const [teamsOpen, setTeamsOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);

  const sections = useMemo(
    () => [
      {
        id: "channels",
        title: "Channels",
        open: channelsOpen,
        toggle: () => setChannelsOpen((prev) => !prev),
        items: workspace?.channels ?? [],
        href: (id: string) => `/dashboard/channels/${id}`,
        emptyLabel: "No channels yet",
      },
      {
        id: "spaces",
        title: "Spaces",
        open: spacesOpen,
        toggle: () => setSpacesOpen((prev) => !prev),
        items: workspace?.spaces ?? [],
        href: (id: string) => `/dashboard/spaces/${id}`,
        emptyLabel: "No spaces yet",
      },
      {
        id: "teams",
        title: "Teams",
        open: teamsOpen,
        toggle: () => setTeamsOpen((prev) => !prev),
        items: workspace?.teams ?? [],
        href: (id: string) => `/dashboard/teams/${id}`,
        emptyLabel: "No teams yet",
      },
      {
        id: "projects",
        title: "Projects",
        open: projectsOpen,
        toggle: () => setProjectsOpen((prev) => !prev),
        items: workspace?.projects ?? [],
        href: (id: string) => `/dashboard/projects/${id}`,
        emptyLabel: "No projects yet",
      },
    ],
    [workspace, channelsOpen, spacesOpen, teamsOpen, projectsOpen]
  );

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-72"} ${mode === "overlay" ? "h-full" : "min-h-screen"} relative flex flex-col border-r border-slate-200 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white transition-all duration-300 shadow-xl`}
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-500 via-cyan-400 to-blue-500 opacity-60" />

      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 backdrop-blur">
        {!collapsed && <h2 className="text-lg font-semibold">Workspace Hub</h2>}
        <div className="flex items-center gap-2">
          {mode === "overlay" && (
            <button
              aria-label="Close sidebar"
              onClick={onClose}
              className="rounded-lg border border-white/20 p-2 hover:bg-white/10"
            >
              <Menu size={18} />
            </button>
          )}
          <button
            aria-label="Toggle sidebar"
            onClick={() => setCollapsed((prev) => !prev)}
            className="rounded-lg border border-white/20 p-2 hover:bg-white/10"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>

      {/* Quick actions */}
      {!collapsed && (
        <div className="border-b border-white/10 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Quick actions</p>
          <div className="mt-3 grid gap-2">
            <ButtonLink href="/dashboard/spaces" label="New space" />
            <ButtonLink href="/dashboard/projects" label="New project" />
            <ButtonLink href="/dashboard/channels" label="New channel" />
          </div>
        </div>
      )}

      <nav className={`flex-1 overflow-y-auto ${collapsed ? "px-2" : "px-4"}`}>
        <div className="space-y-4 py-4">
          {sections.map((section) => (
            <div key={section.id}>
              <button
                onClick={section.toggle}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold transition hover:bg-white/10 ${collapsed ? "justify-center" : ""}`}
              >
                {!collapsed && <span>{section.title}</span>}
                {section.open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {section.open && (
                <div className={`mt-1 space-y-1 ${collapsed ? "px-0" : "pl-3"}`}>
                  {section.items.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-white/50">{section.emptyLabel}</p>
                  ) : (
                    section.items.map((item) => (
                      <Link
                        key={item.id}
                        href={section.href(item.id)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 ${collapsed ? "justify-center" : ""}`}
                      >
                        <span className="truncate">{item.name}</span>
                        {!collapsed && item.description && (
                          <Badge variant="outline" className="ml-auto max-w-[6rem] truncate text-xs">
                            {item.description}
                          </Badge>
                        )}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}

function ButtonLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border border-white/20 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10"
    >
      <span>{label}</span>
      <Plus size={16} />
    </Link>
  );
}

