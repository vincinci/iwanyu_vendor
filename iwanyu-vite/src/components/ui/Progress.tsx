import React from 'react';
import { clsx } from 'clsx';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className,
  size = 'md',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={clsx('w-full bg-gray-200 rounded-full overflow-hidden', sizes[size], className)}>
      <div
        className="h-full bg-yellow-500 transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};