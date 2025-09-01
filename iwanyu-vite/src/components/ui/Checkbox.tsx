import React from 'react';
import { clsx } from 'clsx';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  className,
  id,
  ...props
}) => {
  const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1">
      <div className="flex items-center">
        <input
          type="checkbox"
          id={checkboxId}
          className={clsx(
            'h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded',
            className
          )}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className="ml-2 block text-sm text-gray-900">
            {label}
          </label>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};