"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Heart, Link as LinkIcon, MapPin } from "lucide-react";

interface PublicProfileViewProps {
  userId: string;
}

export default function PublicProfileView({ userId }: PublicProfileViewProps) {
  const { data: profile } = trpc.profile.getSinglePublicProfile.useQuery({ id: userId }, { enabled: !!userId });
  const { data: currentUser } = trpc.user.me.useQuery();
  const utils = trpc.useUtils();
  const [showMessage, setShowMessage] = useState(false);
  const isInitiallyInterested = useMemo(
    () => (profile?.likesReceived || []).some((l: any) => l.userId === currentUser?.id),
    [profile?.likesReceived, currentUser?.id]
  );
  const [isInterested, setIsInterested] = useState<boolean>(isInitiallyInterested);

  const toggleInterest = trpc.profile.toggleInterest.useMutation({
    onSuccess: () => utils.profile.getSinglePublicProfile.invalidate({ id: userId }),
  });

  if (!profile) return null;

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username || "User";

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <Card className="overflow-hidden border-2">
        <CardContent className="p-6">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar || ''} alt={fullName} />
              <AvatarFallback>{fullName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{fullName}</h1>
              {profile.username && (
                <p className="text-muted-foreground">@{profile.username}</p>
              )}
              {profile.bio && <p className="mt-3 text-foreground/80">{profile.bio}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">{profile.userType}</Badge>
                {profile.memberProfile?.rolePreferences?.map((r: string) => (
                  <Badge key={r} variant="outline">{r}</Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  if (!currentUser?.id) return;
                  await toggleInterest.mutateAsync({ profileId: userId });
                  setIsInterested((v) => !v);
                }}
                disabled={!currentUser?.id || toggleInterest.isPending}
                className={isInterested ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" : ""}
              >
                <Heart className={`mr-2 h-4 w-4 ${isInterested ? 'fill-current' : ''}`} />
                {isInterested ? 'Interested' : 'Mark as interested'}
              </Button>
              <Button variant="outline" onClick={() => setShowMessage(true)} disabled={!currentUser?.id}>
                Message
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {profile.memberProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Member Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {typeof profile.memberProfile.experience === 'number' && (
                    <div className="text-sm"><span className="text-muted-foreground">Experience: </span><span className="font-medium">{profile.memberProfile.experience} years</span></div>
                  )}
                  {profile.memberProfile.rolePreferences?.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Preferred Roles</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.memberProfile.rolePreferences.map((r: string) => (
                          <Badge key={r} variant="outline">{r}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {profile.founderProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Founder Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {typeof profile.founderProfile.companyExperience === 'number' && (
                    <div className="text-sm"><span className="text-muted-foreground">Company Experience: </span><span className="font-medium">{profile.founderProfile.companyExperience} years</span></div>
                  )}
                  {profile.founderProfile.industryPreferences?.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Industries</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.founderProfile.industryPreferences.map((i: string) => (
                          <Badge key={i} variant="outline">{i}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {profile.investorProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Investor Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.investorProfile.preferredIndustries?.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Preferred Industries</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.investorProfile.preferredIndustries.map((i: string) => (
                          <Badge key={i} variant="outline">{i}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {profile.website && (
            <div className="mt-8">
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
                <LinkIcon className="h-4 w-4" />
                Visit website
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

