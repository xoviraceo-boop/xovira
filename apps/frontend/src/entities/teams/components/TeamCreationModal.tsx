"use client";

import React from "react";
import { Users2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import { useAppDispatch } from "@/hooks/useReduxStore";
import { trpc } from "@/lib/trpc";
import { upsertTeam } from "@/stores/slices/team.slice";
import { serializeDates } from "@/stores/utils/serialize";
import { cn } from "@/lib/utils";

type TeamCreationModalProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreated?: (id: string) => void;
};

const STATUS_OPTIONS = [
	{ label: "Published", value: "PUBLISHED", helper: "Showcase the team to collaborators immediately." },
	{ label: "Draft", value: "DRAFT", helper: "Keep things private while you're assembling the details." },
] as const;

const INITIAL_STATE = {
	name: "",
	description: "",
	status: "PUBLISHED",
};

export function TeamCreationModal({ open, onOpenChange, onCreated }: TeamCreationModalProps) {
	const dispatch = useAppDispatch();
	const { toast } = useToast();
	const [form, setForm] = React.useState(INITIAL_STATE);
	const createMutation = trpc.team.publish.useMutation();
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
				description: "Please share both a team name and a short description.",
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

			dispatch(upsertTeam({ id, data: serializeDates(data as any) }));
			await utils.team.list.invalidate();
			toast({
				title: "Team created",
				description: "You've unlocked a fresh space for your collaborators.",
			});
			onCreated?.(id);
			onOpenChange(false);
		} catch (error: any) {
			console.error("Failed to create team:", error);
			toast({
				title: "Could not create the team",
				description: error?.message ?? "Please try again once the network calms down.",
				variant: "destructive",
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl gap-6">
				<DialogHeader className="gap-1.5">
					<DialogTitle className="text-2xl font-semibold tracking-tight">Spin up a new team</DialogTitle>
					<DialogDescription className="text-base text-muted-foreground">
						Define the vibe, outline the mission, and get everyone aligned before the invites roll out.
					</DialogDescription>
				</DialogHeader>

				<form className="flex flex-col gap-5" onSubmit={handleSubmit}>
					<div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 shadow-sm">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							<div className="flex items-center justify-center rounded-2xl bg-white/80 p-3 text-blue-600 shadow-inner">
								<Users2 className="h-6 w-6" />
							</div>
							<div className="space-y-1">
								<p className="text-sm font-semibold text-slate-900">Give collaborators a rally point.</p>
								<p className="text-sm text-muted-foreground">
									A crisp title and intention-driven description make it effortless to recruit the right people.
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="team-name" className="text-sm font-medium text-slate-700">
							Team name
						</Label>
						<Input
							id="team-name"
							name="name"
							placeholder="Ex: Growth Engineering Collective"
							value={form.name}
							onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
							className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
							required
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="team-description" className="text-sm font-medium text-slate-700">
								Description
							</Label>
							<span className="text-xs text-muted-foreground">Highlight the mission in a few sentences</span>
						</div>
						<Textarea
							id="team-description"
							name="description"
							placeholder="Outline who you’re looking for, the focus areas, or the goals for this season..."
							value={form.description}
							onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
							className="min-h-[120px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="team-status" className="text-sm font-medium text-slate-700">
							Status
						</Label>
						<Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
							<SelectTrigger id="team-status" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200">
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
								"w-full rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-2xl sm:w-auto",
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
								"Create team"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default TeamCreationModal;

