import Shell from "@/components/layout/Shell";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome to Xovira</h1>
          <p className="text-muted-foreground">Build teams, launch projects, and publish proposals to the marketplace.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>Create proposals, projects, and teams</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard" className="inline-flex items-center text-primary hover:underline">Go to dashboard →</Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Marketplace</CardTitle>
              <CardDescription>Discover proposals, teams, and projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge>Trending</Badge>
                <Badge variant="secondary">New</Badge>
              </div>
              <Link href="/marketplace" className="inline-flex items-center text-primary hover:underline">Explore marketplace →</Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
