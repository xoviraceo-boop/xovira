"use client";
import { cn } from "@/lib/utils";

interface MainHeaderProps {
  title?: string;
  description?: string;  
  className?: string;
}

export default function MainHeader({
  title = "Marketplace",
  description = "Discover published proposals.",
  className,
}: MainHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}