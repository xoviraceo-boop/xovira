import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
	value?: number;
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
	return (
		<div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)} {...props}>
			<div
				className="h-full w-full flex-1 bg-primary transition-all"
				style={{ transform: `translateX(-${100 - Math.max(0, Math.min(100, value))}%)` }}
			/>
		</div>
	);
}


