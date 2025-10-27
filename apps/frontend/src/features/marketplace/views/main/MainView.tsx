import { FeaturedProfileCard } from '../../components/FeaturedProfileCard';
import { FeaturedProposalCard } from '../../components/FeaturedProposalCard';
import { FeaturedTeamCard } from '../../components/FeaturedTeamCard';
import { FeaturedProjectCard } from '../../components/FeaturedProjectCard';

export default function MainContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeaturedProposalCard />
          <FeaturedProjectCard />
          <FeaturedTeamCard />
          <FeaturedProfileCard />
        </div>
      </div>
    </div>
  );
}