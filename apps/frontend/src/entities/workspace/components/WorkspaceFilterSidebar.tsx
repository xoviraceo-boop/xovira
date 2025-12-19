"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

type WorkspaceScope = "owned" | "member" | "all";

type WorkspaceFilterValues = {
	status?: "active" | "archived" | "";
};

type Props = {
	scope: WorkspaceScope;
	onScopeChange: (scope: WorkspaceScope) => void;
	values: WorkspaceFilterValues;
	onChange: (next: WorkspaceFilterValues) => void;
	isOverlay?: boolean;
};

export function WorkspaceFilterSidebar({ scope, onScopeChange, values, onChange, isOverlay = false }: Props) {
	const [collapsed, setCollapsed] = useState(false);
	const Wrapper: React.ElementType = "aside";

	if (typeof document !== "undefined" && !isOverlay) {
		const width = collapsed ? "3rem" : "18rem";
		document.documentElement.style.setProperty("--filter-sidebar-width", width);
	}

	const baseClasses = isOverlay
		? `${collapsed ? "w-12" : "w-72"} bg-background h-full transition-all duration-300`
		: `${collapsed ? "w-12 lg:w-[var(--filter-sidebar-width,_18rem)]" : "w-[var(--filter-sidebar-width,_18rem)]"} border-l bg-background/60 transition-all duration-300`;

	return (
		<Wrapper className={baseClasses}>
			<div
				className={cn(
					"flex h-full flex-col",
					isOverlay ? "overflow-y-auto" : "sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto",
				)}
			>
				<div className="flex items-center justify-between border-b px-3 py-2">
					{!collapsed && <h3 className="text-xs font-semibold uppercase text-muted-foreground">Workspace filters</h3>}
					<button
						onClick={() => setCollapsed((c) => !c)}
						className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
						aria-label="Toggle workspace filters"
					>
						{collapsed ? "›" : "‹"}
					</button>
				</div>

				{collapsed ? (
					<div className="flex flex-1 flex-col items-center justify-start gap-4 py-4 text-muted-foreground">
						<span title="Scope">🧭</span>
						<span title="Status">📁</span>
					</div>
				) : (
					<div className="space-y-6 px-3 py-4 text-sm">
						<section className="space-y-2">
							<h4 className="text-xs font-semibold uppercase text-muted-foreground">Scope</h4>
							<select
								value={scope}
								onChange={(event) => onScopeChange(event.target.value as WorkspaceScope)}
								className="w-full rounded-md border bg-background px-2 py-1 text-sm"
							>
								<option value="owned">Owned</option>
								<option value="member">Member</option>
								<option value="all">All</option>
							</select>
						</section>

						<section className="space-y-2">
							<h4 className="text-xs font-semibold uppercase text-muted-foreground">Status</h4>
							<div className="flex flex-wrap gap-2">
								{[
									["", "All"],
									["active", "Active"],
									["archived", "Archived"],
								].map(([value, label]) => (
									<label key={value} className="inline-flex items-center gap-2 rounded-md border px-2 py-1">
										<input
											type="radio"
											name="workspace-status"
											className="h-4 w-4"
											checked={(values.status || "") === value}
											onChange={() => onChange({ ...values, status: value as WorkspaceFilterValues["status"] })}
										/>
										<span>{label}</span>
									</label>
								))}
							</div>
						</section>
					</div>
				)}
			</div>
		</Wrapper>
	);
}



