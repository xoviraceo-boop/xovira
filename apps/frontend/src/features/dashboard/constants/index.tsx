import { 
  LayoutDashboard,
  MessageSquare,
  FileText,
  Activity,
  AlertCircle,
  Scale,
  CheckSquare,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const actions = [
    {
      title: "Create Proposal",
      description: "Draft and publish to marketplace",
      href: "#proposals",
      buttonText: "New Proposal",
      variant: "default" as const
    },
    {
      title: "Create Project",
      description: "Spin up a new initiative",
      href: "#projects",
      buttonText: "New Project",
      variant: "outline" as const
    },
    {
      title: "Create Team",
      description: "Assemble collaborators",
      href: "#teams",
      buttonText: "New Team",
      variant: "outline" as const
    }
  ];

export const projectMenuItems = [
  { label: "Overview", value: "overview", icon: LayoutDashboard },
  { label: "Discussions", value: "discussions", icon: MessageSquare },
  { label: "Logs", value: "logs", icon: FileText },
  { label: "Activities", value: "activities", icon: Activity },
  { label: "Appeal", value: "appeal", icon: AlertCircle },
  { label: "Governance", value: "governance", icon: Scale },
  { label: "Tasks", value: "tasks", icon: CheckSquare },
  { label: "Members", value: "members", icon: Users },
] as const;

export const DISCUSSSION_FILTERS = [
  { key: "all", label: "All Discussions" },
  { key: "feature", label: "Feature Ideas" },
  { key: "design", label: "Design & UI" },
  { key: "implementation", label: "Implementation" },
  { key: "bugs", label: "Bugs / Fixes" },
  { key: "announcements", label: "Announcements" },
  { key: "others", label: "Others" },
  { key: "issues", label: "Issues" },
  { key: "pinned", label: "Pinned / Highlighted" },
  { key: "author", label: "By Author" },
  { key: "active", label: "Most Active" },
  { key: "upvoted", label: "Most Upvoted" },
] as const;