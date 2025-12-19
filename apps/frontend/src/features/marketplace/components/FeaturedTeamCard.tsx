import React from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

export const FeaturedTeamCard = () => {
  const teams = [
    { name: 'Sarah Chen', role: 'Design Lead', avatar: null },
    { name: 'Mike Ross', role: 'Developer', avatar: null },
    { name: 'Emma Wilson', role: 'Product Manager', avatar: null },
    { name: 'Alex Turner', role: 'UX Designer', avatar: null },
    { name: 'Lisa Park', role: 'Engineer', avatar: null },
    { name: 'Tom Brady', role: 'Analyst', avatar: null },
    { name: 'Nina Patel', role: 'Designer', avatar: null },
    { name: 'Chris Lee', role: 'Developer', avatar: null },
    { name: 'Maya Singh', role: 'Manager', avatar: null }
  ];

  return (
    <Card className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-500">
      <div className="p-6 flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Teams</h3>
          <span className="ml-auto text-sm text-slate-400">{teams.length} members</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-2">
          {teams.map((member, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-800/50 transition-all duration-300 cursor-pointer group">
              <Avatar className="size-12">
                <AvatarImage alt={member.name} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-semibold">
                  {member.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-sm font-medium text-white truncate w-full">{member.name.split(' ')[0]}</p>
                <p className="text-xs text-slate-400 truncate w-full">{member.role}</p>
              </div>
            </div>
          ))}
          </div>
        </div>
        
        <ExploreButton to="/marketplace/teams" />
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
