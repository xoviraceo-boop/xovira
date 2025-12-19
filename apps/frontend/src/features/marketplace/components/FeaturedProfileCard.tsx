import React from 'react';
import { Star, ArrowRight, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

export const FeaturedProfileCard = () => {
  const talents = [
    { name: 'Jessica Martinez', role: 'Senior UI/UX Designer', rating: 4.9, projects: 127 },
    { name: 'John Doe', role: 'Full Stack Developer', rating: 4.8, projects: 95 },
    { name: 'Emily Chen', role: 'Product Designer', rating: 5.0, projects: 83 },
    { name: 'David Kumar', role: 'iOS Developer', rating: 4.7, projects: 71 }
  ];

  return (
    <Card className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-500">
      <div className="p-6 flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Star className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Talented Members</h3>
          </div>
          
          <div className="space-y-4">
          {talents.map((talent, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-all duration-300 cursor-pointer group">
              <Avatar className="size-12">
                <AvatarImage alt={talent.name} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-semibold">
                  {talent.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate group-hover:text-amber-400 transition-colors">{talent.name}</h4>
                <p className="text-xs text-slate-400 truncate">{talent.role}</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-amber-400 font-medium">{talent.rating}</span>
                  </div>
                  <span className="text-xs text-slate-500">{talent.projects} projects</span>
                </div>
              </div>
              <button className="p-2 bg-amber-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          ))}
          </div>
        </div>

        <ExploreButton to="/marketplace/talents" />
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
