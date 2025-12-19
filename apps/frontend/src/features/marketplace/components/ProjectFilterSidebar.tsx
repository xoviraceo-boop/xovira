"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { INDUSTRY_OPTIONS, COUNTRY_OPTIONS } from "@/constants/shares";

type Props = {
  values: {
    industry: string[];
    location?: string;
    stage?: "IDEA" | "MVP" | "BETA" | "LAUNCHED" | "GROWTH" | "SCALE" | "EXIT";
  };
  onChange: (next: Props["values"]) => void;
  isOverlay?: boolean;
};

export default function FilterSidebar({ values, onChange, isOverlay = false }: Props) {
  const [local, setLocal] = useState(values);
  const [collapsed, setCollapsed] = useState(false);

  const Wrapper: React.ElementType = "aside";
  // Drive a CSS variable so desktop layout can reclaim space when collapsed
  if (typeof document !== 'undefined' && !isOverlay) {
    const width = collapsed ? '3rem' : '18rem';
    document.documentElement.style.setProperty('--filter-sidebar-width', width);
  }
  const baseClasses = isOverlay
    ? `${collapsed ? 'w-12' : 'w-72'} bg-background h-full transition-all duration-300`
    : `${collapsed ? 'w-12 lg:w-[var(--filter-sidebar-width,_18rem)]' : 'w-[var(--filter-sidebar-width,_18rem)]'} border-l bg-background/50 transition-all duration-300`;

  const toggleArray = (key: keyof Props["values"], val: string) => {
    const arr = new Set((local[key] as string[]) || []);
    if (arr.has(val)) arr.delete(val); else arr.add(val);
    const next = { ...local, [key]: Array.from(arr) } as Props["values"];
    setLocal(next); onChange(next);
  };

  return (
    <Wrapper className={baseClasses}>
      <div className={cn(isOverlay ? "h-full overflow-y-auto" : "sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto")}
        style={{ padding: collapsed ? '0.5rem' : '1rem' }}
      >
        <div className="mb-3 flex items-center justify-between">
          {!collapsed && <h3 className="text-xs font-semibold uppercase text-muted-foreground">Filters</h3>}
          <button
            className="rounded p-1 hover:bg-muted"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle filters"
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {!collapsed && <div className="space-y-6">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Industry</h3>
            <div className="space-y-1">
              {INDUSTRY_OPTIONS.slice(0, 10).map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={local.industry.includes(opt.value)} onChange={() => toggleArray("industry", opt.value)} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Stage</h3>
            <select className="w-full rounded-md border px-2 py-1 text-sm" value={local.stage || ""} onChange={(e) => { const next = { ...local, stage: (e.target.value || undefined) as any }; setLocal(next); onChange(next); }}>
              <option value="">Any</option>
              {['IDEA','MVP','BETA','LAUNCHED','GROWTH','SCALE','EXIT'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Location</h3>
            <select className="w-full rounded-md border px-2 py-1 text-sm" value={local.location || ""} onChange={(e) => { const next = { ...local, location: e.target.value || undefined }; setLocal(next); onChange(next); }}>
              <option value="">Any Country</option>
              {COUNTRY_OPTIONS.slice(0, 30).map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </section>
        </div>}

        {collapsed && (
          <div className="flex flex-col items-center gap-3 py-2 text-muted-foreground">
            <span title="Industry">🏭</span>
            <span title="Stage">🚀</span>
            <span title="Location">📍</span>
          </div>
        )}
      </div>
    </Wrapper>
  );
}
