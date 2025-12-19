// components/public/team-public-view.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  MapPin,
  Briefcase,
  Heart,
  MessageCircle,
  Share2,
  Award,
  CheckCircle2,
  Star,
  TrendingUp,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CommentSection } from '@/entities/comments/components/CommentSection';

export default function TeamPublicView({ team }: { team: any }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative border-b bg-card">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        
        <div className="container relative mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl text-center"
          >
            {/* Avatar */}
            {team.avatar && (
              <div className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-full border-4 border-border shadow-xl">
                <Image
                  src={team.avatar}
                  alt={team.name}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
            )}

            {/* Name & Description */}
            <h1 className="mb-4 text-5xl font-bold tracking-tight">{team.name}</h1>
            <p className="mb-6 text-xl text-muted-foreground">
              {team.description}
            </p>

            {/* Tags */}
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <Users className="h-3 w-3" />
                {team.size} Members
              </Badge>
              <Badge variant="secondary" className="gap-1.5">
                <Briefcase className="h-3 w-3" />
                {team.teamType.replace('_', ' ')}
              </Badge>
              {team.isHiring && (
                <Badge className="bg-green-500/10 text-green-700">
                  🚀 Hiring
                </Badge>
              )}
              {team.isRemote && (
                <Badge variant="outline">🌍 Remote</Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button className="gap-2">
                <Users className="h-4 w-4" />
                Join Team
              </Button>
              <Button variant="outline">
                View Projects
              </Button>
            </div>

            {/* Stats Bar */}
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatsBox icon={Users} label="Members" value={team.size} />
              <StatsBox icon={Briefcase} label="Projects" value={team.projects?.length || 0} />
              <StatsBox icon={Heart} label="Likes" value={team._count?.likes || 0} />
              <StatsBox icon={Award} label="Reviews" value={team._count?.reviews || 0} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* About Section */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-4 text-2xl font-bold">About the Team</h2>
                    <p className="leading-relaxed text-foreground/80">
                      {team.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Skills */}
                {team.skills.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-4 text-2xl font-bold">Team Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {team.skills.map((skill: string) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Industry */}
                {team.industry.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="mb-4 text-2xl font-bold">Industries</h2>
                      <div className="flex flex-wrap gap-2">
                        {team.industry.map((ind: string) => (
                          <Badge key={ind} variant="outline">
                            {ind}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Comments */}
                <Card>
                  <CardContent className="p-6">
                    <CommentSection
                      postId={team.id}
                      feedId={team.id}
                      feedType="team"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="members" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-6 text-2xl font-bold">Team Members</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {team.members?.map((member: any) => (
                        <MemberCard key={member.id} member={member} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-4 text-2xl font-bold">Active Projects</h2>
                    <p className="text-muted-foreground">
                      Projects will be displayed here
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/*ActionBar
              entityId={team.id}
              entityType="team"
              likesCount={team._count?.likes || 0}
            />

            {/* Team Info */}
            <Card>
              <CardContent className="space-y-4 p-6">
                <h3 className="font-semibold">Team Information</h3>
                {team.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{team.location}</span>
                  </div>
                )}
                {team.owner && (
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">Team Lead</p>
                    <Link
                      href={`/profile/${team.owner.username}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={team.owner.avatar || ''} />
                        <AvatarFallback>{team.owner.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{team.owner.name}</span>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatsBox({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-lg border bg-card p-4 text-center">
      <Icon className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function MemberCard({ member }: any) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.user?.avatar || ''} />
            <AvatarFallback>{member.user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{member.user?.name}</p>
            <p className="text-sm text-muted-foreground">{member.role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}