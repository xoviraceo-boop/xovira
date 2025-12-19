import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

export const FeaturedProposalCard = () => {
  const featured = [
    { 
      title: 'AI-powered Data Platform', 
      author: 'Sarah Chen', 
      type: 'Platform',
      status: 'Active',
      budget: '$50k'
    },
    { 
      title: 'Mobile App Redesign', 
      author: 'Mike Ross', 
      type: 'Design',
      status: 'In Progress',
      budget: '$30k'
    },
    { 
      title: 'E-commerce Platform', 
      author: 'Emma Wilson', 
      type: 'Development',
      status: 'Planning',
      budget: '$75k'
    }
  ];

  return (
    <Card className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-500">
      <div className="p-6 flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Star className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Featured</h3>
          <span className="ml-auto px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full">Top Picks</span>
          </div>
          
          <div className="space-y-4">
          {featured.map((item, i) => (
            <div key={i} className="p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-all duration-300 cursor-pointer border border-slate-700/30 hover:border-purple-500/30 group">
              <div className="flex items-start gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-semibold">
                    {item.author.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white mb-1 truncate group-hover:text-purple-400 transition-colors">{item.title}</h4>
                  <p className="text-xs text-slate-400 mb-2">by {item.author}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-md">{item.type}</span>
                    <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-md">{item.status}</span>
                    <span className="ml-auto text-xs font-semibold text-white">{item.budget}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
        
        <ExploreButton to="/marketplace/proposals" />
      </div>
    </Card>
  );
};
const ExploreButton = ({ to }: { to: string }) => {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push(to)}
      className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25"
    >
      Explore <ArrowRight className="w-4 h-4" />
    </Button>
  );
};