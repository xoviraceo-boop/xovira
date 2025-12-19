import { ExternalLinkIcon, FileTextIcon, ShoppingCart, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface MaterialData {
    id: string;
    title: string;
    description: string | null;
    category: string;
    priceUsd: number | null;
    thumbnailUrl: string | null;
    fileUrl: string | null; // Still displayed if applicable (e.g., if free)
    externalUrl: string | null;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    owner: {
        id: string;
        name: string | null;
        email: string | null;
    } | null;
}

interface MaterialPublicViewProps {
    material: MaterialData;
}

/**
 * MaterialPublicView: Marketplace view for external users.
 * Focuses on preview, price, and primary actions (Buy/Download).
 */
export function MaterialPublicView({ material }: MaterialPublicViewProps) {
    const formattedPrice = material.priceUsd != null && material.priceUsd > 0
        ? `$${material.priceUsd.toFixed(2)}`
        : "Free";
    
    const isPaid = material.priceUsd != null && material.priceUsd > 0;
    const ownerDisplayName = material.owner?.name || "Anonymous Creator";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Column 1: Description and Details */}
            <div className="lg:col-span-2 space-y-6">
                <header className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-sm font-semibold">{material.category}</Badge>
                        <p className="text-sm text-muted-foreground">By **{ownerDisplayName}**</p>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">{material.title}</h1>
                    <p className="max-w-4xl text-lg text-gray-700 dark:text-gray-300">
                        {material.description || "A detailed description is not yet available for this material."}
                    </p>
                </header>
                
                <Separator />

                {/* Additional Links (If provided) */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Additional Resources</h2>
                    <div className="flex flex-wrap gap-4">
                        {material.externalUrl && (
                            <Button variant="outline">
                                <a href={material.externalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                                    View Project Page <ExternalLinkIcon className="h-4 w-4" />
                                </a>
                            </Button>
                        )}
                        {!material.externalUrl && (
                            <p className="text-sm text-muted-foreground italic flex items-center gap-1"><Info className="h-4 w-4"/> No external links available.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Column 2: Buy/Download Panel */}
            <div className="lg:col-span-1 space-y-6">
                <Card className="shadow-xl sticky top-6">
                    <CardHeader className="p-0">
                        {material.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                                src={material.thumbnailUrl} 
                                alt={`Cover image for ${material.title}`} 
                                className="w-full h-48 object-cover rounded-t-lg"
                            />
                        ) : (
                            <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-t-lg flex items-center justify-center text-muted-foreground border-b">
                                
                                Cover Preview
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {/* Price Display */}
                        <div className="text-center">
                            <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                            <p className="text-5xl font-extrabold text-primary">{formattedPrice}</p>
                        </div>

                        <Separator />

                        {/* Primary CTA */}
                        {isPaid ? (
                            <Button className="w-full text-lg h-12" size="lg">
                                <ShoppingCart className="h-5 w-5 mr-2" /> Purchase Now
                            </Button>
                        ) : (
                            // Action for free material
                            material.fileUrl ? (
                                <Button asChild className="w-full text-lg h-12" size="lg">
                                    <a href={material.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2">
                                        Download Material <FileTextIcon className="h-5 w-5" />
                                    </a>
                                </Button>
                            ) : (
                                <Button className="w-full text-lg h-12" size="lg" disabled>
                                    <FileTextIcon className="h-5 w-5 mr-2" /> Download Unavailable
                                </Button>
                            )
                        )}
                        <p className="text-xs text-center text-muted-foreground">
                            {isPaid ? "Secure payment via Stripe/PayPal." : "Free download available instantly."}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}