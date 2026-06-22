import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={twMerge('animate-pulse-fast rounded bg-slate-200 dark:bg-slate-800', className)}
      {...props}
    />
  );
};
