import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  className?: string;
  size?: number;
}

export const Loader: React.FC<LoaderProps> = ({ className, size = 24 }) => {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 size={size} className={cn("animate-spin text-primary", className)} />
    </div>
  );
};
