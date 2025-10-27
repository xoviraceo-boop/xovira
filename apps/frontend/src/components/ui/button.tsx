import * as React from "react";
import { LucideIcon } from "lucide-react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "google" | "destructive" | "ghost";
  icon?: LucideIcon;
  children?: React.ReactNode;
};

export function Button({
  className = "",
  variant = "primary",
  icon: Icon,
  children,
  ...props
}: ButtonProps) {

  const baseStyle = 'w-full flex items-center justify-center font-semibold py-3 rounded-lg transition duration-300 transform active:scale-98 shadow-md focus:outline-none focus:ring-4';

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
    variantClass = 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800';
  }
  return (
    <button className={`${baseStyle} ${variantClass} ${className}`} {...props}>
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </button>
  );
}

export default Button;
