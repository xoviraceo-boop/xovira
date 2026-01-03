import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "google" | "destructive" | "ghost";
  icon?: LucideIcon;
  children?: React.ReactNode;
  size?: "default" | "sm" | "lg" | "icon";
};

// Export buttonVariants function for use in other components (like calendar)
export function buttonVariants({
  variant = "primary",
  size = "default",
  className,
}: {
  variant?: "primary" | "outline" | "google" | "destructive" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
} = {}) {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-lg transition duration-300 transform active:scale-98 shadow-md focus:outline-none focus:ring-4';

  let variantClass = '';
  if (variant === 'primary') {
    variantClass = 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-300';
  } else if (variant === 'google') {
    variantClass = 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm focus:ring-gray-200';
  } else if (variant === 'outline') {
    variantClass = 'bg-transparent border border-cyan-500 text-cyan-600 hover:bg-cyan-50 focus:ring-cyan-200';
  } else if (variant === 'destructive') {
    variantClass = 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-300';
  } else if (variant === 'ghost') {
    variantClass = 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 shadow-none';
  }

  let sizeClass = '';
  if (size === 'sm') {
    sizeClass = 'h-8 px-3 text-sm';
  } else if (size === 'lg') {
    sizeClass = 'h-12 px-6 text-base';
  } else if (size === 'icon') {
    sizeClass = 'h-10 w-10 p-0';
  } else {
    sizeClass = 'h-10 px-4 py-2';
  }

  // Don't include w-full here - let the Button component or caller add it if needed
  return cn(
    baseStyle,
    variantClass,
    sizeClass,
    className
  );
}

export function Button({
  className = "",
  variant = "primary",
  size = "default",
  icon: Icon,
  children,
  ...props
}: ButtonProps) {
  // Add w-full for default size buttons (not icon size)
  const widthClass = size !== 'icon' ? 'w-full' : '';
  
  return (
    <button 
      className={cn(buttonVariants({ variant, size }), widthClass, className)} 
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </button>
  );
}

export default Button;
