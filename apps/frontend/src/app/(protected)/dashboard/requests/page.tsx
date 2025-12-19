"use client";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  getCoreRowModel,
  flexRender,
  useReactTable,
} from "@tanstack/react-table";
import { useDebounce } from '@/hooks/useDebounce';
import Shell from '@/components/layout/Shell';
import { useEffect } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';
import { useQueryClient } from '@tanstack/react-query';

type RowItem = {
  id: string;
  title: string;
  type: string;
  fromTo: string;
  role: string;
  team: string;
  project: string;
  status: string;
  date: string;
};

export default function RequestsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [status, setStatus] = useState<string>("");
  const [scope, setScope] = useState<"received" | "sent">("received");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = trpc.request.list.useQuery({
    query: debouncedQuery || undefined,
    status: (status || undefined) as any,
    scope,
    page,
    pageSize,
  });

  // Real-time: refresh when a new notification arrives (request received/viewed)
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected) return;
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: [["request","list"]] as any });
    };
    socket.on('notification:new', refresh);
    return () => {
      socket.off('notification:new', refresh);
    };
  }, [socket, isConnected, queryClient]);

  const rows: RowItem[] = useMemo(() => {
    return (data?.items || []).map((a: any) => {
      const title = a.proposal?.title || a.message?.slice(0, 40) || "Request";
      const type = a.targetType === "COLLABORATION" ? "Join Request" : a.targetType;
      const fromTo = scope === "received" ? `${a.sender?.name || a.senderId} → You` : `You → ${a.receiver?.name || a.receiverId}`;
      const role = scope === "received" ? "Receiver" : "Sender";
      const team = a.team?.name || "-";
      const project = a.project?.name || "-";
      const status = a.status?.charAt(0) + a.status?.slice(1).toLowerCase();
      const date = new Date(a.createdAt).toISOString().slice(0, 10);
      return { id: a.id, title, type, fromTo, role, team, project, status, date };
    });
  }, [data, scope]);

  const columns = useMemo<ColumnDef<RowItem>[]>(() => [
    { accessorKey: "title", header: "Request Title", cell: ({ row }) => row.original.title },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "fromTo", header: "From / To" },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "team", header: "Team" },
    { accessorKey: "project", header: "Project" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "date", header: "Date" },
    { id: "actions", header: "Actions", cell: ({ row }) => (
      <Button variant="outline" onClick={() => router.push(`/dashboard/requests/${row.original.id}`)}>View</Button>
    ) },
  ], [router]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Shell>
      <div className="container mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Requests</h1>
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex gap-3 items-center">
              <Input
                placeholder="Search requests..."
                value={query}
                onChange={(e) => { setPage(1); setQuery(e.target.value); }}
                className="w-64"
              />
              <select
                className="h-9 border rounded-md px-3 bg-background"
                value={status}
                onChange={(e) => { setPage(1); setStatus(e.target.value); }}
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
                <option value="EXPIRED">Expired</option>
              </select>
              <select
                className="h-9 border rounded-md px-3 bg-background"
                value={scope}
                onChange={(e) => { setPage(1); setScope(e.target.value as any); }}
              >
                <option value="received">Received</option>
                <option value="sent">Sent</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Most recent</span>
            </div>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="text-left font-medium px-4 py-3">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td className="px-4 py-6" colSpan={columns.length}>Loading...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td className="px-4 py-6" colSpan={columns.length}>No requests found</td></tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="border-t">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t bg-background">
            <div className="text-sm text-muted-foreground">Page {page} of {totalPages} • {total} total</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
              <select
                className="h-8 border rounded-md px-2 bg-background"
                value={pageSize}
                onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }}
              >
                {[10, 20, 30, 40, 50].map(size => (
                  <option key={size} value={size}>{size} / page</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </div>
    </Shell>
  );
}


