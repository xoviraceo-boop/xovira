import { PostComposer } from '@/entities/posts/components/PostComposer';
import { PostList } from '@/entities/posts/components/PostList';
import { ActivityLog } from '@/entities/logs/components/ActivityLog';

export function ActivitiesView() {
  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl font-bold">Activity Feed</h1>
          
          <PostComposer feedType="global" />
          
          <PostList feedType="global" />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ActivityLog
            category="SYSTEM"
            title="Recent Activity"
          />
        </div>
      </div>
    </div>
  );
}