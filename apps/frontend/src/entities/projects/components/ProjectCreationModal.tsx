"use client";

import React from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import { useAppDispatch } from "@/hooks/useReduxStore";
import { trpc } from "@/lib/trpc";
import { upsertProject } from "@/stores/slices/project.slice";
import { serializeDates } from "@/stores/utils/serialize";
import { cn } from "@/lib/utils";

type ProjectCreationModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreated?: (id: string) => void;
};

const STATUS_OPTIONS = [
	{ label: "Published", value: "PUBLISHED", helper: "Visible to your entire workspace." },
	{ label: "Draft", value: "DRAFT", helper: "Perfect while you're still polishing the details." },
] as const;

const INITIAL_STATE = {
	name: "",
	description: "",
	status: "PUBLISHED",
};

export function ProjectCreationModal({ open, onOpenChange, onCreated }: ProjectCreationModalProps) {
	const dispatch = useAppDispatch();
	const { toast } = useToast();
	const [form, setForm] = React.useState(INITIAL_STATE);
	const createMutation = trpc.project.publish.useMutation();
	const isSubmitting = createMutation.isPending;
	const utils = trpc.useUtils();

	React.useEffect(() => {
		if (!open) {
			setForm(INITIAL_STATE);
			createMutation.reset();
		}
	}, [open]);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!form.name.trim() || !form.description.trim()) {
			toast({
				title: "Missing details",
				description: "Please proavide both a title and a short description.",
				variant: "destructive",
			});
			return;
		}

		try {
			const { id, data } = await createMutation.mutateAsync({
				name: form.name.trim(),
				description: form.description.trim(),
				status: form.status,
			} as any);

			dispatch(upsertProject({ id, data: serializeDates(data as any) }));
			await utils.project.list.invalidate();
			toast({
				title: "Project created",
				description: "Your project draft is ready. Continue building the details.",
			});
			onCreated?.(id);
			onOpenChange(false);
		} catch (error: any) {
			console.error("Failed to create project:", error);
			toast({
				title: "Could not create the project",
				description: error?.message ?? "Please try again in a moment.",
				variant: "destructive",
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl gap-6">
				<DialogHeader className="gap-1.5">
					<DialogTitle className="text-2xl font-semibold tracking-tight">Launch a new project</DialogTitle>
					<DialogDescription className="text-base text-muted-foreground">
						Capture the essentials now, refine the rest later. Your workspace will thank you.
					</DialogDescription>
				</DialogHeader>

				<form className="flex flex-col gap-5" onSubmit={handleSubmit}>
					<div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-4 shadow-sm">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							<div className="flex items-center justify-center rounded-2xl bg-white/80 p-3 text-cyan-600 shadow-inner">
								<Sparkles className="h-6 w-6" />
							</div>
							<div className="space-y-1">
								<p className="text-sm font-semibold text-slate-900">Set the tone for your next big release.</p>
								<p className="text-sm text-muted-foreground">
									Keep it concise. A clear title and a confident description help teammates jump in faster.
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="project-name" className="text-sm font-medium text-slate-700">
							Project title
						</Label>
						<Input
							id="project-name"
							name="name"
							placeholder="Ex: Horizon AI Workbench"
							value={form.name}
							onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
							className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
							required
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="project-description" className="text-sm font-medium text-slate-700">
								Description
							</Label>
							<span className="text-xs text-muted-foreground">200 characters is a sweet spot</span>
						</div>
						<Textarea
							id="project-description"
							name="description"
							placeholder="Share the vision, mission, or the problem you're about to solve..."
							value={form.description}
							onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
							className="min-h-[120px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="project-status" className="text-sm font-medium text-slate-700">
							Status
						</Label>
						<Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
							<SelectTrigger id="project-status" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm text-slate-900 shadow-xs focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200">
								<SelectValue placeholder="Choose how visible this should be" />
							</SelectTrigger>
							<SelectContent className="rounded-2xl border border-slate-100 shadow-xl">
								{STATUS_OPTIONS.map((option) => (
									<SelectItem key={option.value} value={option.value} className="rounded-lg px-3 py-2.5">
										<span className="flex flex-col items-start gap-0.5">
											<span className="text-sm font-semibold text-slate-900">{option.label}</span>
											<span className="text-xs text-muted-foreground">{option.helper}</span>
										</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{createMutation.error && (
						<p className="text-sm text-red-600">
							{createMutation.error.message || "Something unexpected happened. Please try again."}
						</p>
					)}

					<DialogFooter className="gap-3">
						<Button
							type="button"
							variant="ghost"
							className="w-full rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 sm:w-auto"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className={cn(
								"w-full rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-2xl sm:w-auto",
								isSubmitting && "opacity-90"
							)}
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<span className="flex items-center gap-2">
									<span className="size-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
									Creating...
								</span>
							) : (
								"Create project"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default ProjectCreationModal;

