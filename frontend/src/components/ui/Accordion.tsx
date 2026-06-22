import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  defaultOpen = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={twMerge('border-b border-slate-200 dark:border-slate-800 last:border-0', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left font-medium text-foreground transition-all duration-200 hover:text-primary"
      >
        <span className="text-sm md:text-base font-semibold">{title}</span>
        <ChevronDown
          className={twMerge(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180 text-primary'
          )}
        />
      </button>
      <div
        className={twMerge(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[1000px] opacity-100 pb-4' : 'max-h-0 opacity-0'
        )}
      >
        <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ children, className }) => {
  return <div className={twMerge('w-full', className)}>{children}</div>;
};
