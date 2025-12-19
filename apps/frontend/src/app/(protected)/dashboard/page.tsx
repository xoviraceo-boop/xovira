"use client"
import Shell from "@/components/layout/Shell";
import { trpc } from "@/lib/trpc";
import ProposalCard from "@/entities/proposals/components/ProposalCard";
import ProjectCard from "@/entities/projects/components/ProjectCard";
import TeamCard from "@/entities/teams/components/TeamCard";
import { 
  MainHeader, 
  Action, 
  MainContent 
} from "@/features/dashboard/views/main";
import { actions } from '@/features/dashboard/constants';
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
// Assuming you have relevant icons imported here (e.g., from 'lucide-react' or 'react-icons')
import { FileText, Briefcase, Users } from 'lucide-react'; // Example icons

export default function DashboardPage() {
  const router = useRouter();

  // The trpc calls are fine, but ensure the types are correctly handled in the consuming component
  const proposals = trpc.proposal.list.useQuery({ pageSize: 5 });
  const projects = trpc.project.list.useQuery({});
  const teams = trpc.team.list.useQuery({});

  const sections = [
    {
      id: "proposals",
      title: "Your Proposals",
      description: "Latest proposals you created.",
      viewAllHref: "/dashboard/proposals",
      items: proposals.data?.items || [],
      // FIX: Improved the emptyState for specificity and added an icon/action
      emptyState: (
        <div className="p-8">
          <EmptyState
            title="No Proposals Found"
            message="Looks like you haven't created any proposals yet. Start drafting your first one now."
            icon={<FileText className="w-12 h-12" />}
            actionButton={
              <button onClick={() => router.push('/dashboard/proposals/create')}>
                Create Proposal
              </button>
            }
          />
        </div>
      ), // <-- **FIXED: Missing comma was here**
      isLoading: proposals.isLoading,
      renderItem: (item: any) => (
        <ProposalCard 
          item={item} 
          onOpen={(id) => router.push(`/dashboard/proposals/${id}`)} 
        />
      ), // <-- **FIXED: Missing comma was here**
    },
    {
      id: "projects",
      title: "Your Projects",
      description: "Create multiple projects and track progress.",
      viewAllHref: "/dashboard/projects",
      items: projects.data?.items || [],
      isLoading: projects.isLoading,
      emptyState: (
        <div className="p-8">
          <EmptyState
            title="No Projects Found"
            message="No active projects found. Get started by creating a new one to organize your tasks and milestones."
            icon={<Briefcase className="w-12 h-12" />}
            actionButton={
              <button onClick={() => router.push('/dashboard/projects/create')}>
                Create Project
              </button>
            }
          />
        </div>
      ), 
      renderItem: (item: any) => (
        <ProjectCard 
          item={item} 
          onOpen={(id) => router.push(`/dashboard/projects/${id}`)} 
        />
      ),
    },
    {
      id: "teams",
      title: "Your Teams",
      description: "Create multiple teams and manage members.",
      viewAllHref: "/dashboard/teams",
      items: teams.data?.items || [],
      isLoading: teams.isLoading,
      emptyState: (
        <div className="p-8">
          <EmptyState
            title="No Teams Found"
            message="You aren't a member of any teams yet. Create a new team or ask a colleague to invite you."
            icon={<Users className="w-12 h-12" />}
            actionButton={
              <button onClick={() => router.push('/dashboard/teams/create')}>
                Create Team
              </button>
            }
          />
        </div>
      ), 
      renderItem: (item: any) => (
        <TeamCard 
          item={item} 
          onOpen={(id) => router.push(`/dashboard/teams/${id}`)} 
        />
      ),
    },
  ];
  
  return (
    <Shell>
      <div className="space-y-8">
        <MainHeader
          title="Dashboard"
          description="Create proposals, projects, and teams. Publish proposals to marketplace."
        />
        <Action actions={actions} columns={3} />
        <MainContent sections={sections} />
      </div>
    </Shell>
  );
}