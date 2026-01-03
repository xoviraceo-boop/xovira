import Shell from "@/components/layout/Shell";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, ShoppingBag, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-12 py-8">
        {/* Hero Section: Refined Typography & Contrast */}
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-primary/10 bg-primary/5 w-fit">
            <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">v1.0 is Live</span>
        </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Welcome to Xovira
            </h1>
            <p className="max-w-[600px] text-lg text-muted-foreground leading-relaxed">
              The collaborative engine for modern builders. 
              Assemble elite teams, launch high-impact projects, and showcase your work.
            </p>
          </div>
        </header>

        {/* Feature Grid: Interactive Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Dashboard Card */}
          <Link href="/dashboard" className="group">
            <Card className="h-full transition-all duration-300 hover:ring-1 hover:ring-primary/50 hover:shadow-xl hover:shadow-primary/5 bg-gradient-to-b from-card to-background">
              <CardHeader className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                  <LayoutDashboard className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl">Personal Dashboard</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Manage your active workstreams, track team progress, and draft your next big proposal.
                  </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center text-sm font-medium text-primary">
                  Launch Workspace 
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
            </CardContent>
          </Card>
          </Link>

          {/* Marketplace Card */}
          <Link href="/marketplace" className="group">
            <Card className="h-full transition-all duration-300 hover:ring-1 hover:ring-primary/50 hover:shadow-xl hover:shadow-primary/5 bg-gradient-to-b from-card to-background">
              <CardHeader className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center transition-colors group-hover:bg-secondary/80">
                    <ShoppingBag className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div className="flex gap-1.5">
                    <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">Trending</Badge>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold">NEW</Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl">Global Marketplace</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Discover open opportunities, join existing squads, or source talent for your initiatives.
                  </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center text-sm font-medium text-primary">
                  Browse Projects 
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
          </Link>
        </div>
      </div>
    </Shell>
  );
}