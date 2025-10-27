import * as React from "react";
import { cn } from "@/lib/utils";

export interface SeparatorProps
	extends React.HTMLAttributes<HTMLDivElement> {
	orientation?: "horizontal" | "vertical";
	decorative?: boolean;
}

export function Separator({ className, orientation = "horizontal", decorative = true, ...props }: SeparatorProps) {
	return (
		<div
			role={decorative ? "none" : "separator"}
			aria-orientation={orientation}
			className={cn(
				"shrink-0 bg-border",
				orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
				className
			)}
			{...props}
		/>
	);
}


