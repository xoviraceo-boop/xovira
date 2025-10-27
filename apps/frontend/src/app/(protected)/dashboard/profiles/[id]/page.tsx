"use client";
import Shell from "@/components/layout/Shell";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Profile = {
  id: string;
  name: string;
  title?: string;
  role?: string;
  bio?: string;
  email?: string;
  website?: string;
  linkedin?: string;
};

export default function ProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    // Placeholder: fetch from your profiles service / trpc when available
    (async () => {
      setLoading(true);
      try {
        // TODO: replace with real data source
        const mock: Profile = { id, name: "Member", title: "", role: "", bio: "", email: "", website: "", linkedin: "" };
        if (active) setProfile(mock);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  return (
    <Shell>
      <div className="max-w-3xl">
        {loading ? (
          <div className="space-y-4">
            <div className="h-7 w-1/2 animate-pulse rounded bg-muted/60" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted/50" />
            <div className="h-24 w-full animate-pulse rounded bg-muted/40" />
          </div>
        ) : profile ? (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            {(profile.title || profile.role) && (
              <p className="text-sm text-muted-foreground">{profile.title || profile.role}</p>
            )}
            {profile.bio && <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>}
            <div className="space-y-1 text-sm">
              {profile.email && <div>Email: {profile.email}</div>}
              {profile.website && <div>Website: {profile.website}</div>}
              {profile.linkedin && <div>LinkedIn: {profile.linkedin}</div>}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Profile not found.</p>
        )}
      </div>
    </Shell>
  );
}


