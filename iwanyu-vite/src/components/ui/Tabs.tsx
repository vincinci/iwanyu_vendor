import React from 'react';
import { clsx } from 'clsx';

interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ children }) => {
  return <div>{children}</div>;
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return (
    <div className={clsx('border-b border-gray-200', className)}>
      <nav className="-mb-px flex space-x-8">
        {children}
      </nav>
    </div>
  );
};

interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  active?: boolean;
  onClick?: () => void;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  children, 
  active = false, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'py-2 px-1 border-b-2 font-medium text-sm',
        active
          ? 'border-yellow-500 text-yellow-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      )}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  active?: boolean;
}

export const TabsContent: React.FC<TabsContentProps> = ({ 
  children, 
  active = false 
}) => {
  if (!active) return null;
  return <div className="mt-6">{children}</div>;
};