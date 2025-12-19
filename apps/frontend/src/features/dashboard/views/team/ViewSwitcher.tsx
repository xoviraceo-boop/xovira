
import { OverviewView } from './OverviewView';
import { DiscussionsView } from './DiscussionsView';
import { LogsView } from './LogsView';
import { ActivitiesView } from './ActivitiesView';
import { AppealView } from './AppealView';
import { GovernanceView } from './GovernanceView';
import { TasksView } from './TasksView';
import { MembersView } from './MembersView';
import { ChatView } from './ChatView';
import { AnalyticsView } from './AnalyticsView';

interface ViewSwitcherProps {
  activeTab: string;
  team?: any;
}

export default function ViewSwitcher({ activeTab, team }: ViewSwitcherProps) {

  const renderView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView team={team} />;
      case 'discussions':
        return <DiscussionsView teamId={team?.id} />;
      case 'chat':
        return <ChatView contextType="PROJECT" contextId={team?.id} contextName={team?.name} />;
      case 'logs':
        return <LogsView />;
      case 'activities':
        return <ActivitiesView teamId={team?.id} />;
      case 'appeal':
        return <AppealView />;
      case 'governance':
        return <GovernanceView />;
      case 'tasks':
        return <TasksView />;
      case 'members':
        return <MembersView />
      default:
        return <OverviewView team={team} />;
    }
  };

 return (
    <div className="flex-1 overflow-auto bg-slate-50">
      {renderView()}
    </div>
  );
}
