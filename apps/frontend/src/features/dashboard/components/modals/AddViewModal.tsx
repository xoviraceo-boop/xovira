"use client";

import { useState, useMemo } from "react";
import { Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ViewType = "projects" | "teams" | "docs" | "tasks" | "channels" | "proposals" | "tools" | "materials";

interface ViewOption {
	id: ViewType;
	label: string;
	description: string;
	icon?: string;
	category: "default" | "additional";
}

const availableViews: ViewOption[] = [
	{ id: "projects", label: "Projects", description: "View and manage projects", category: "default" },
	{ id: "teams", label: "Teams", description: "View and manage teams", category: "default" },
	{ id: "docs", label: "Docs", description: "View and manage documents", category: "default" },
	{ id: "tasks", label: "Tasks", description: "View and manage tasks", category: "additional" },
	{ id: "channels", label: "Channels", description: "View and manage channels", category: "additional" },
	{ id: "proposals", label: "Proposals", description: "View and manage proposals", category: "additional" },
	{ id: "tools", label: "Tools", description: "View and manage tools", category: "additional" },
	{ id: "materials", label: "Materials", description: "View and manage materials", category: "additional" },
];

interface AddViewModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	existingViews: ViewType[];
	onAddViews: (views: ViewType[]) => void;
}

export function AddViewModal({ open, onOpenChange, existingViews, onAddViews }: AddViewModalProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedViews, setSelectedViews] = useState<ViewType[]>([]);

	const filteredViews = useMemo(() => {
		const query = searchQuery.toLowerCase().trim();
		if (!query) return availableViews;
		return availableViews.filter(
			(view) =>
				view.label.toLowerCase().includes(query) ||
				view.description.toLowerCase().includes(query)
		);
	}, [searchQuery]);

	const availableToAdd = useMemo(() => {
		return filteredViews.filter((view) => !existingViews.includes(view.id));
	}, [filteredViews, existingViews]);

	const toggleView = (viewId: ViewType) => {
		setSelectedViews((prev) =>
			prev.includes(viewId) ? prev.filter((id) => id !== viewId) : [...prev, viewId]
		);
	};

	const handleAdd = () => {
		if (selectedViews.length > 0) {
			onAddViews(selectedViews);
			setSelectedViews([]);
			setSearchQuery("");
			onOpenChange(false);
		}
	};

	const handleClose = () => {
		setSelectedViews([]);
		setSearchQuery("");
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Add Views</DialogTitle>
					<DialogDescription>
						Select views to add to your space. You can add multiple views at once.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Search */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search views..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>

					{/* Views List */}
					<div className="max-h-[400px] overflow-y-auto rounded-lg border border-slate-200">
						{availableToAdd.length === 0 ? (
							<div className="flex items-center justify-center py-12 px-4 text-center">
								<div>
									<p className="text-sm font-medium text-foreground">No views available</p>
									<p className="mt-1 text-xs text-muted-foreground">
										{searchQuery
											? "Try a different search term"
											: "All available views have been added"}
									</p>
								</div>
							</div>
						) : (
							<div className="divide-y divide-slate-100">
								{availableToAdd.map((view) => {
									const isSelected = selectedViews.includes(view.id);
									return (
										<button
											key={view.id}
											onClick={() => toggleView(view.id)}
											className={cn(
												"flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
												"hover:bg-slate-50",
												isSelected && "bg-slate-50"
											)}
										>
											<div
												className={cn(
													"mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
													isSelected
														? "border-primary bg-primary text-primary-foreground"
														: "border-slate-300"
												)}
											>
												{isSelected && <Check className="h-3 w-3" />}
											</div>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<p className="text-sm font-medium text-foreground">{view.label}</p>
													{view.category === "additional" && (
														<Badge variant="outline" className="text-xs">
															New
														</Badge>
													)}
												</div>
												<p className="mt-0.5 text-xs text-muted-foreground">{view.description}</p>
											</div>
										</button>
									);
								})}
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleAdd} disabled={selectedViews.length === 0}>
						Add {selectedViews.length > 0 ? `${selectedViews.length} ` : ""}View
						{selectedViews.length !== 1 ? "s" : ""}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

