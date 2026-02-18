'use client';

import React, { useState, useMemo } from 'react';
import { Integration } from '@xovira/types';
import { INTEGRATION_CATEGORIES, AVAILABLE_INTEGRATIONS } from '../constants';
import { IntegrationCard } from '../components/IntegrationCard';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export const IntegrationsView = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Mock state for connections
    const [connectedProviders, setConnectedProviders] = useState<Record<string, boolean>>({
        'github': true,
        'slack': true,
    });

    const [configuringProvider, setConfiguringProvider] = useState<string | null>(null);

    const handleToggle = (provider: string, enabled: boolean) => {
        setConnectedProviders(prev => ({
            ...prev,
            [provider]: enabled
        }));
    };

    const handleConfigure = (provider: string) => {
        setConfiguringProvider(provider);
    };

    const filteredIntegrations = useMemo(() => {
        return AVAILABLE_INTEGRATIONS.filter(integration => {
            // Filter by category
            if (activeCategory !== 'all' && integration.category !== activeCategory) {
                return false;
            }
            // Filter by search
            if (searchQuery && !integration.name.toLowerCase().includes(searchQuery.toLowerCase()) && !integration.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            return true;
        }).map(integration => ({
            ...integration,
            isConnected: !!connectedProviders[integration.provider]
        }));
    }, [activeCategory, searchQuery, connectedProviders]);

    return (
        <div className="h-full flex flex-col space-y-6 max-w-[1600px] mx-auto w-full">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Integrations</h1>
                    <p className="text-zinc-500 max-w-2xl text-lg">
                        Connect your favorite tools to streamline your workflow and boost productivity.
                    </p>
                </div>
                <Button variant="outline" className="gap-2 border-zinc-200 text-zinc-700 hover:text-zinc-900">
                    <Plus size={16} />
                    <span>Request Integration</span>
                </Button>
            </div>

            <Separator className="bg-zinc-200" />

            {/* Controls Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between sticky top-0 py-2 bg-white/50 backdrop-blur-sm z-10 transition-all">
                {/* Category Filters */}
                <ScrollArea className="w-full sm:w-auto max-w-[calc(100vw-32px)] whitespace-nowrap">
                    <div className="flex items-center gap-1 p-1">
                        {INTEGRATION_CATEGORIES.map((category) => (
                            <Button
                                key={category.id}
                                variant={activeCategory === category.id ? "default" : "ghost"}
                                onClick={() => setActiveCategory(category.id)}
                                className={`
                  h-9 rounded-full px-4 text-sm font-medium transition-all
                  ${activeCategory === category.id
                                        ? "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800"
                                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                                    }
                `}
                            >
                                {category.label}
                            </Button>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="invisible" />
                </ScrollArea>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search integrations..."
                        className="pl-9 h-10 bg-white border-zinc-200 focus-visible:ring-zinc-900"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                {filteredIntegrations.map((integration) => (
                    <IntegrationCard
                        key={integration.provider}
                        integration={integration}
                        onToggle={handleToggle}
                        onConfigure={handleConfigure}
                    />
                ))}
                {filteredIntegrations.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                            <SlidersHorizontal className="h-8 w-8 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-900">No integrations found</h3>
                        <p className="text-zinc-500 mt-2">
                            Try adjusting your search or filter to find what you're looking for.
                        </p>
                        <Button
                            variant="link"
                            className="mt-4 text-zinc-900"
                            onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                        >
                            Clear filters
                        </Button>
                    </div>
                )}
            </div>

            <Dialog open={!!configuringProvider} onOpenChange={(open) => !open && setConfiguringProvider(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Configure {configuringProvider ? AVAILABLE_INTEGRATIONS.find(i => i.provider === configuringProvider)?.name : 'Integration'}</DialogTitle>
                        <DialogDescription>
                            Manage settings and permissions for this integration.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-zinc-900">Sync Settings</h4>
                            <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
                                <span className="text-sm text-zinc-600">Auto-sync data</span>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
                                <span className="text-sm text-zinc-600">Push notifications</span>
                                <Switch defaultChecked />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-zinc-900">Permissions</h4>
                            <p className="text-xs text-zinc-500">
                                This integration has access to:
                            </p>
                            <ul className="list-disc list-inside text-xs text-zinc-600 space-y-1 ml-1">
                                <li>Read user profile</li>
                                <li>Sync calendar events</li>
                                <li>Send messages on your behalf</li>
                            </ul>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfiguringProvider(null)}>Cancel</Button>
                        <Button onClick={() => setConfiguringProvider(null)}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
