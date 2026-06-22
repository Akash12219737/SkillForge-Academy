import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={twMerge(
            'flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-background text-foreground">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs font-semibold text-destructive">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
