"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function teamView({ team }: { team: any }) {
  if (!team) return <p className="text-sm text-muted-foreground">No data</p>;
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{team.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-muted-foreground">{team.shortSummary}</p>
            <div className="mt-4 whitespace-pre-wrap">{team.detailedDesc}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Type</div>
              <div>{team.category || team.type}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Status</div>
              <div>{team.status}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Industry</div>
              <div>{Array.isArray(team.industry) ? team.industry.join(", ") : team.industry}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Keywords</div>
              <div>{Array.isArray(team.keywords) ? team.keywords.join(", ") : ''}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


