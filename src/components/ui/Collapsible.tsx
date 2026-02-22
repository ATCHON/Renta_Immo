'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleProps {
  id?: string;
  title: string;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Collapsible({
  id,
  title,
  defaultOpen = false,
  className,
  children,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!id) return;

    const handleOpen = (event: CustomEvent<{ id: string }>) => {
      if (event.detail?.id === id) {
        setIsOpen(true);
      }
    };

    window.addEventListener('open-collapsible', handleOpen as EventListener);
    return () => {
      window.removeEventListener('open-collapsible', handleOpen as EventListener);
    };
  }, [id]);

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-surface hover:bg-border/50 transition-colors duration-fast text-left"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-charcoal">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-stone" />
        ) : (
          <ChevronDown className="h-5 w-5 text-stone" />
        )}
      </button>
      <div
        className={cn(
          'transition-all duration-normal ease-out overflow-hidden',
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-6 bg-white">{children}</div>
      </div>
    </div>
  );
}
