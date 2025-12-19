"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/useToast";
import { Loader2 } from "lucide-react";

interface CreateSpaceModalProps {
	workspaceId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: (spaceId: string) => void;
}

export function CreateSpaceModal({ workspaceId, open, onOpenChange, onSuccess }: CreateSpaceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const createMutation = trpc.space.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Space created",
        description: "Your new space has been created successfully.",
      });
      utils.workspace.get.invalidate({ id: workspaceId });
      utils.space.list.invalidate({ workspaceId } as any);
      setName("");
      setDescription("");
      onOpenChange(false);
      if (onSuccess) {
        onSuccess(data.id);
      }
    },
	onError: (error) => {
		toast({
				title: "Failed to create space",
				description: error.message || "Something went wrong. Please try again.",
				variant: "destructive",
			});
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			toast({
				title: "Name required",
				description: "Please provide a name for the space.",
				variant: "destructive",
			});
			return;
		}

		await createMutation.mutateAsync({
			workspaceId,
			name: name.trim(),
			description: description.trim() || null,
			isActive: true,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Create New Space</DialogTitle>
					<DialogDescription>
						Create a new space to organize projects, teams, and resources within this workspace.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="name">Space Name *</Label>
							<Input
								id="name"
								placeholder="e.g., Product Development, Marketing Team"
								value={name}
								onChange={(e) => setName(e.target.value)}
								disabled={createMutation.isPending}
								autoFocus
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								placeholder="Describe what this space is for..."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								disabled={createMutation.isPending}
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={createMutation.isPending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={createMutation.isPending || !name.trim()}>
							{createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Create Space
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

