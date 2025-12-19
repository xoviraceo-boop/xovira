"use client";
import { trpc } from "@/lib/trpc";
import UserForm from "@/entities/users/components/UserForm";
import { useState } from "react";

export default function MyProfilePage() {
  const { data: me, isLoading } = trpc.user.me.useQuery();
  const [editing, setEditing] = useState(false);
  const deleteMutation = trpc.user.delete.useMutation();

  const handleDelete = async () => {
    const confirmed = window.confirm("This will permanently delete your account. Continue?");
    if (!confirmed) return;
    await deleteMutation.mutateAsync();
    if (typeof window !== 'undefined') {
      window.location.href = "/";
    }
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <div className="flex items-center gap-2">
          <button className="rounded-md border px-3 py-2 text-sm" onClick={() => setEditing((v) => !v)}>
            {editing ? "View" : "Edit"}
          </button>
          <button className="rounded-md border px-3 py-2 text-sm text-red-600" onClick={handleDelete} disabled={deleteMutation.isPending}>
            Delete
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-7 w-40 animate-pulse rounded bg-muted/60" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted/50" />
          <div className="h-24 w-full animate-pulse rounded bg-muted/40" />
        </div>
      ) : editing ? (
        <UserForm />
      ) : me ? (
        <div className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">Name:</span> {me.firstName} {me.lastName}</div>
          <div><span className="text-muted-foreground">Username:</span> {me.username}</div>
          <div><span className="text-muted-foreground">Email:</span> {me.email}</div>
          <div><span className="text-muted-foreground">Phone:</span> {me.phone}</div>
          <div><span className="text-muted-foreground">Website:</span> {me.website}</div>
          <div><span className="text-muted-foreground">Location:</span> {me.location}</div>
          <div><span className="text-muted-foreground">Timezone:</span> {me.timezone}</div>
          {me.bio && <div className="pt-2"><span className="text-muted-foreground">Bio:</span><div className="whitespace-pre-wrap">{me.bio}</div></div>}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Unable to load profile.</p>
      )}
    </div>
  );
}


