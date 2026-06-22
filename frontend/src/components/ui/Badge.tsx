import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  
  const variants = {
    default: 'bg-primary text-white border-transparent',
    secondary: 'bg-secondary text-secondary-foreground border-transparent border border-slate-200 dark:border-slate-800',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-transparent',
    destructive: 'bg-destructive/10 text-destructive border-transparent',
    outline: 'text-foreground border border-slate-300 dark:border-slate-700',
  };

  return (
    <div
      className={twMerge(clsx(baseStyles, variants[variant], className))}
      {...props}
    />
  );
};
