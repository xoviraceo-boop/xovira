"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useMessages } from "@/entities/messages/hooks/useMessages";

export default function MessageBell() {
  useMessages();
  const { data } = trpc.messages.listConversations.useQuery({ page: 1, pageSize: 20 });
  const unread = (data?.items || []).reduce((sum: number, c: any) => sum + (Number(c.unread) || 0), 0);

  return (
    <Link href="/dashboard/messages" className="relative inline-flex items-center justify-center">
      <div className="group rounded-full border-2 border-cyan-100 bg-white p-2 hover:border-cyan-300 hover:shadow-md transition-all">
        <Mail className="h-5 w-5 text-slate-700 group-hover:text-cyan-600" />
      </div>
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  );
}


