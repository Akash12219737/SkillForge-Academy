import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, className }) => {
  // Pass current value and click handlers down to children
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, { activeValue: value, onValueChange });
    }
    return child;
  });

  return <div className={twMerge('w-full', className)}>{childrenWithProps}</div>;
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  activeValue?: string;
  onValueChange?: (value: string) => void;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className, activeValue, onValueChange }) => {
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, { activeValue, onValueChange });
    }
    return child;
  });

  return (
    <div
      className={twMerge(
        'inline-flex items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground w-full sm:w-auto border border-slate-200 dark:border-slate-800',
        className
      )}
    >
      {childrenWithProps}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeValue?: string;
  onValueChange?: (value: string) => void;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className,
  activeValue,
  onValueChange,
}) => {
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      onClick={() => onValueChange?.(value)}
      className={twMerge(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'hover:text-foreground hover:bg-slate-200/50 dark:hover:bg-slate-800/50',
        className
      )}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeValue?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className, activeValue }) => {
  if (activeValue !== value) return null;

  return <div className={twMerge('mt-4 focus-visible:outline-none animate-fade-in', className)}>{children}</div>;
};
