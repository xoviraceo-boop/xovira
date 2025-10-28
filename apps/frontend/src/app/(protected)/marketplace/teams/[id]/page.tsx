"use client";
import Shell from "@/components/layout/Shell";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import TeamForm from '@/entities/teams/components/TeamForm';
import TeamView from "@/features/marketplace/views/team/TeamView";
import Button from "@/components/ui/button";

export default function TeamDetailPage() {
	const params = useParams();
	const id = params?.id as string;
	const [editing, setEditing] = useState(false);
	const { data: cloud, isLoading, error } = trpc.team.get.useQuery({ id }, { enabled: !!id });
	const router = useRouter();

	// Redirect to dashboard if team doesn't exist
	useEffect(() => {
		if (!isLoading && !cloud && !error) {
			router.push('/dashboard/teams');
		}
	}, [cloud, isLoading, error, router]);

	if (isLoading) {
		return (
			<Shell>
				<div className="flex items-center justify-center h-64">
					<p className="text-muted-foreground">Loading team...</p>
				</div>
			</Shell>
		);
	}

	if (!cloud) {
		return null; // Will redirect via useEffect
	}

	return (
		<Shell>
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-2xl font-bold">Team</h1>
				<Button onClick={() => setEditing((v) => !v)}>{editing ? 'View' : 'Edit'}</Button>
			</div>
			{editing ? (
				<TeamForm teamId={id} mode="edit" />
			) : (
				<TeamView team={cloud as any} />
			)}
		</Shell>
	);
}


