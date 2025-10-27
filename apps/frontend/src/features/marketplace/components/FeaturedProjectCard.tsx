import React from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export const FeaturedProjectCard = () => {
  const projects = [
    { 
      title: 'NFT Marketplace', 
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop',
      category: 'Blockchain',
      engagement: '2.4k',
      trending: '+24%'
    },
    { 
      title: 'HealthTech Dashboard', 
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=200&fit=crop',
      category: 'Healthcare',
      engagement: '1.8k',
      trending: '+18%'
    },
    { 
      title: 'AI Content Generator', 
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop',
      category: 'AI/ML',
      engagement: '3.1k',
      trending: '+31%'
    }
  ];

  return (
    <Card className="h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-500">
      <div className="p-6 flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-rose-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Trending Projects</h3>
          <span className="ml-auto px-3 py-1 bg-rose-500/10 text-rose-400 text-xs font-medium rounded-full">Hot</span>
          </div>
          
          <div className="space-y-4">
          {projects.map((project, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden cursor-pointer group">
              <div className="aspect-video relative">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold text-white">{project.title}</h4>
                    <span className="px-2 py-1 bg-rose-500/20 text-rose-400 text-xs font-medium rounded backdrop-blur-sm whitespace-nowrap">{project.trending}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded backdrop-blur-sm">{project.category}</span>
                    <span className="text-xs text-slate-300">{project.engagement} views</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
        
        <ExploreButton to="/marketplace/projects" />
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
