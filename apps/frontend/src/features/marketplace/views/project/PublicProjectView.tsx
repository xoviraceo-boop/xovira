'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Users,
  TrendingUp,
  MapPin,
  Globe,
  CheckCircle2,
  Building2,
  Target,
  Zap,
  DollarSign,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommentSection } from '@/entities/comments/components/CommentSection';

const formatDate = (d: string | Date) => new Date(d).toLocaleDateString();

const formatCurrency = (n: number, currency: string = 'USD') => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n);

interface ProjectPublicViewProps {
  project: any; // Type based on your Prisma query
}

export default function ProjectPublicView({ project }: ProjectPublicViewProps) {
  const [activeTab, setActiveTab] = useState('overview');

  function formatNumber(viewCount: any): string | number {
    return viewCount;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        
        <div className="container relative mx-auto px-4 py-12 md:py-20">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left Column - Project Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-center space-y-6"
            >
              {/* Logo & Name */}
              <div className="flex items-start gap-4">
                {project.logo && (
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-border/50 shadow-lg">
                    <Image
                      src={project.logo}
                      alt={project.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                    {project.name}
                  </h1>
                  {project.tagline && (
                    <p className="mt-2 text-xl text-muted-foreground">
                      {project.tagline}
                    </p>
                  )}
                </div>
              </div>

              {/* Tags & Industry */}
              <div className="flex flex-wrap gap-2">
                {project.stage && (
                  <Badge variant="secondary" className="gap-1.5">
                    <Zap className="h-3 w-3" />
                    {project.stage.replace('_', ' ')}
                  </Badge>
                )}
                {project.industry.slice(0, 3).map((ind: string) => (
                  <Badge key={ind} variant="outline">
                    {ind}
                  </Badge>
                ))}
                {project.isHiring && (
                  <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                    <Users className="mr-1 h-3 w-3" />
                    Hiring
                  </Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-lg leading-relaxed text-foreground/80">
                {project.description}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatsCard
                  icon={Heart}
                  label="Likes"
                  value={formatNumber(project?._count?.likes || 10)}
                />
                <StatsCard
                  icon={Users}
                  label="Team"
                  value={project.teamSize}
                />
                <StatsCard
                  icon={MessageCircle}
                  label="Comments"
                  value={formatNumber(project?._count?.comments || 10)}
                />
                <StatsCard
                  icon={TrendingUp}
                  label="Views"
                  value={formatNumber(project?.viewCount || 10)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button className="gap-2">
                  Get Involved
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {project.website && (
                  <Button variant="outline">
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Right Column - Featured Image/Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <Card className="overflow-hidden border-2 shadow-2xl">
                <CardContent className="p-0">
                  <div className="relative aspect-video w-full bg-muted">
                    {project.logo && (
                      <Image
                        src={project.logo}
                        alt={project.name}
                        fill
                        className="object-cover"
                      />
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Floating stats */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                      {project.fundingRaised > 0 && (
                        <div className="rounded-lg bg-black/50 px-3 py-2 backdrop-blur-sm">
                          <p className="text-xs text-white/70">Raised</p>
                          <p className="text-lg font-bold text-white">
                            {formatCurrency(project.fundingRaised)}
                          </p>
                        </div>
                      )}
                      {project.isFeatured && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          ⭐ Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Founder Card */}
              <Card className="mt-6 border-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2">
                      <AvatarImage src={project?.owner?.avatar || ''} />
                      <AvatarFallback>
                        {project?.owner?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {project?.owner?.name || 'Anonymous'}
                        </p>
                        {project?.owner?.verificationLevel !== 'UNVERIFIED' && (
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Project Founder
                      </p>
                      {project?.owner?.location && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {project.owner.location}
                        </div>
                      )}
                    </div>
                    <Button variant="outline">
                      <Link href={`/profile/${project?.owner?.username}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left - Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Detailed Description */}
                <Card>
                  <CardContent className="prose dark:prose-invert max-w-none p-6">
                    <h2 className="flex items-center gap-2 text-2xl font-bold">
                      <Building2 className="h-5 w-5" />
                      About {project.name}
                    </h2>
                    <p className="text-base leading-relaxed">
                      {project.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Target Market */}
                {project.targetMarket && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                        <Target className="h-5 w-5" />
                        Target Market
                      </h3>
                      <p className="text-foreground/80">{project.targetMarket}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Competitive Edge */}
                {project.competitiveEdge && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                        <Zap className="h-5 w-5" />
                        Competitive Advantage
                      </h3>
                      <p className="text-foreground/80">{project.competitiveEdge}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Revenue Model */}
                {project.revenueModel.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                        <DollarSign className="h-5 w-5" />
                        Revenue Model
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {project.revenueModel.map((model: string) => (
                          <Badge key={model} variant="secondary">
                            {model}
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
                      postId=''
                      feedId={project.id}
                      feedType="project"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-6 text-2xl font-bold">Team Members</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {project?.members?.map((member: any) => (
                        <TeamMemberCard key={member.id} member={member} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="updates" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="mb-4 text-2xl font-bold">Recent Updates</h2>
                    <p className="text-muted-foreground">
                      Check back soon for updates from the team!
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right - Sidebar */}
          <div className="space-y-6">
            {/* Action Bar 
            <ActionBar
              entityId={project.id}
              entityType="project"
              likesCount={project._count.likes}
            />*/}

            {/* Project Info */}
            <Card>
              <CardContent className="space-y-4 p-6">
                <h3 className="font-semibold">Project Details</h3>
                <Separator />
                
                <InfoItem
                  icon={Calendar}
                  label="Founded"
                  value={formatDate(project.createdAt)}
                />
                
                {project.location && (
                  <InfoItem
                    icon={MapPin}
                    label="Location"
                    value={project.location}
                  />
                )}

                {project.isRemoteFriendly && (
                  <InfoItem
                    icon={Globe}
                    label="Work Style"
                    value="Remote Friendly"
                  />
                )}

                <InfoItem
                  icon={Users}
                  label="Team Size"
                  value={`${project.teamSize} members`}
                />

                {project.fundingGoal && (
                  <InfoItem
                    icon={DollarSign}
                    label="Funding Goal"
                    value={formatCurrency(project.fundingGoal)}
                  />
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {project.tags.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper Components
function StatsCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <p className="text-xs">{label}</p>
      </div>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function TeamMemberCard({ member }: { member: any }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.user.avatar || ''} />
            <AvatarFallback>{member.user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{member.user.name}</p>
            <p className="text-sm text-muted-foreground">{member.role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}