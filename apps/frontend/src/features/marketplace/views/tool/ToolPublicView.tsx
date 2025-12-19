import { ExternalLinkIcon, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ToolData {
    id: string;
    name: string;
    description?: string | null;
    category: string;
    productUrl: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface ToolPublicViewProps {
    tool: ToolData;
}

/**
 * MaterialPublicView: Marketplace view for external users.
 * Focuses on preview, price, and primary actions (Buy/Download).
 */
export function ToolPublicView({ tool }: ToolPublicViewProps) {
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Column 1: Description and Details */}
            <div className="lg:col-span-2 space-y-6">
                <header className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-sm font-semibold">{tool.category}</Badge>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">{tool.name}</h1>
                    <p className="max-w-4xl text-lg text-gray-700 dark:text-gray-300">
                        {tool.description || "A detailed description is not yet available for this tool."}
                    </p>
                </header>
                
                <Separator />

                {/* Additional Links (If provided) */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Additional Resources</h2>
                    <div className="flex flex-wrap gap-4">
                        {tool.productUrl && (
                            <Button variant="outline">
                                <a href={tool.productUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                                    Open Tool Link <ExternalLinkIcon className="h-4 w-4" />
                                </a>
                            </Button>
                        )}
                        {!tool.productUrl && (
                            <p className="text-sm text-muted-foreground italic flex items-center gap-1"><Info className="h-4 w-4"/> No external links available.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Column 2: Access Panel */}
            <div className="lg:col-span-1 space-y-6">
                <Card className="shadow-xl sticky top-6">
                    <CardHeader>
                        <CardTitle>Access</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <Button className="w-full" size="lg" variant="outline" asChild>
                            <a href={tool.productUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2">
                                Open Tool Link <ExternalLinkIcon className="h-4 w-4" />
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
