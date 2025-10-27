"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { DISCUSSSION_FILTERS } from "../../constants";

interface DiscussionsViewProps {
  projectId?: string;
}

export const DiscussionsView = ({ projectId }: DiscussionsViewProps) => {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<typeof DISCUSSSION_FILTERS[number]["key"]>("all");

  const { data, isLoading } = trpc.discussions?.list.useQuery(
    {
      projectId: projectId as string,
      query,
      filter: activeFilter,
      page: 1,
      pageSize: 20,
    },
    { enabled: !!projectId }
  ) as any;

  const discussions = data?.items ?? [];
  const related = useMemo(() => (discussions as any[]).slice(0, 5), [discussions]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Discussions</h1>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search discussions..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {DISCUSSSION_FILTERS.map((f) => (
            <Button
              key={f.key}
              variant={activeFilter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-3">
          <div className="bg-white rounded-lg shadow border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <p className="font-medium text-slate-700">Related discussions</p>
            </div>
            <div className="p-3">
              {related.length === 0 && (
                <p className="text-sm text-slate-500">No related discussions</p>
              )}
              <ul className="space-y-2">
                {related.map((d: any) => (
                  <li key={d.id}>
                    <Link href={`/dashboard/projects/${d.projectId}/discussions/${d.id}`} className="text-sm text-slate-700 hover:underline">
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <section className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <p className="text-slate-600">Recent discussions and conversations</p>
              <Link href={`/dashboard/projects/${projectId}/discussions/new`}>
                <Button size="sm">Create New</Button>
              </Link>
            </div>
            <div className="divide-y">
              {isLoading && (
                <div className="p-6 text-slate-500">Loading...</div>
              )}
              {!isLoading && discussions.length === 0 && (
                <div className="p-6 text-slate-500">No discussions yet. Start a conversation!</div>
              )}
              {discussions.map((d: any) => (
                <Link key={d.id} href={`/dashboard/projects/${d.projectId}/discussions/${d.id}`} className="block p-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{d.title}</p>
                      <p className="text-sm text-slate-500 line-clamp-1">{d.summary}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(d.tags || []).map((t: string) => (
                          <span key={t} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">#{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <div>{d._count?.comments ?? 0} comments</div>
                      <div>{d.upvotes ?? 0} upvotes</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};