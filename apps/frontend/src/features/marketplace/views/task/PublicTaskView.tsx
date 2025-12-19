import React from 'react';


type Visibility = 'PUBLIC' | 'PRIVATE' | 'WORKSPACE' | 'TEAM' | string;

interface Task {
  title: string;
  description?: string;
  isPublic: boolean;
  visibility: Visibility;
  createdAt: string | number | Date;
  assignee?: {
    name?: string;
    email?: string;
  };
  project?: {
    name?: string;
  };
  team?: {
    name?: string;
  };
  channel?: {
    name?: string;
  };
}

interface PublicTaskViewProps {
  task: Task;
  updatedAt: string; // The original snippet uses 'updatedAt' as a standalone variable
}

// Placeholder components based on the classes used in the original snippet
// In a real application, you would import these from your UI library (e.g., Shadcn UI)
const Badge: React.FC<{ variant: 'secondary' | 'default' | 'outline', children: React.ReactNode }> = ({ children, variant }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variant === 'secondary' ? 'bg-gray-100 text-gray-800' : variant === 'default' ? 'bg-blue-500 text-white' : 'border border-gray-200 text-gray-800'}`}>
    {children}
  </span>
);

const Separator: React.FC = () => <div className="shrink-0 bg-gray-200 h-[1px] w-full" />;
const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="rounded-xl border bg-card text-card-foreground shadow-sm">{children}</div>;
const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="flex flex-col space-y-1.5 p-6">{children}</div>;
const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="font-semibold leading-none tracking-tight">{children}</h3>;
const CardContent: React.FC<{ className?: string, children: React.ReactNode }> = ({ children, className = '' }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

// --- Actual Component Implementation ---

const PublicTaskView: React.FC<PublicTaskViewProps> = ({ task, updatedAt }) => {
  // Helper function to safely format the date
  const formatDate = (date: string | number | Date) => {
    try {
      return new Date(date).toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 py-6">
      {/* Header and Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">{task.title}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{task.description || "No description provided."}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Note: The original snippet hardcodes "ACTIVE" */}
          <Badge variant="secondary">{"ACTIVE"}</Badge>
          <Badge variant={task.isPublic ? "default" : "outline"}>{task.visibility}</Badge>
        </div>
      </div>

      {/* Task Metadata Card */}
      <Card>
        <CardHeader>
          <CardTitle>Task meta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {/* Main Metadata Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Assignee</span>
              <p className="font-medium">{task.assignee?.name || task.assignee?.email || "Unassigned"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Project</span>
              <p className="font-medium">{task.project?.name ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Team</span>
              <p className="font-medium">{task.team?.name ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Channel</span>
              <p className="font-medium">{task.channel?.name ? `#${task.channel.name}` : "—"}</p>
            </div>
          </div>

          <Separator />

          {/* Date Information Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <div>Created</div>
              <div className="font-medium text-foreground">{formatDate(task.createdAt)}</div>
            </div>
            <div>
              <div>Last updated</div>
              <div className="font-medium text-foreground">{formatDate(updatedAt)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicTaskView;