import React from 'react';
import { clsx } from 'clsx';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  className,
  fallback,
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={clsx(
          'rounded-full object-cover',
          sizes[size],
          className
        )}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          if (target.nextElementSibling) {
            target.nextElementSibling.classList.remove('hidden');
          }
        }}
      />
    );
  }

  return (
    <div className={clsx(
      'rounded-full bg-yellow-500 flex items-center justify-center',
      sizes[size],
      className
    )}>
      {fallback ? (
        <span className="text-white font-medium text-sm">
          {fallback}
        </span>
      ) : (
        <User className={clsx('text-white', iconSizes[size])} />
      )}
    </div>
  );
};