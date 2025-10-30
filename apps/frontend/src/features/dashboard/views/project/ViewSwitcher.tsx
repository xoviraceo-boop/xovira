
import { OverviewView } from './OverviewView';
import { DiscussionsView } from './DiscussionsView';
import { LogsView } from './LogsView';
import { ActivitiesView } from './ActivitiesView';
import { AppealView } from './AppealView';
import { GovernanceView } from './GovernanceView';
import { TasksView } from './TasksView';
import { MembersView } from './MembersView';

interface ViewSwitcherProps {
  activeTab: string;
  project?: any;
}

export default function ViewSwitcher({ activeTab, project }: ViewSwitcherProps) {

  const renderView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView project={project} />;
      case 'discussions':
        return <DiscussionsView projectId={project?.id} />;
      case 'logs':
        return <LogsView />;
      case 'activities':
        return <ActivitiesView />;
      case 'appeal':
        return <AppealView />;
      case 'governance':
        return <GovernanceView />;
      case 'tasks':
        return <TasksView />;
      case 'members':
        return <MembersView />;
      default:
        return <OverviewView project={project} />;
    }
  };

 return (
    <div className="flex-1 overflow-auto bg-slate-50">
      {renderView()}
    </div>
  );

}
