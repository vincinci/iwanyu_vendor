import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
    
    const variantClasses = {
      default: 'border-transparent bg-yellow-600 text-white hover:bg-yellow-700',
      secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
      destructive: 'border-transparent bg-red-600 text-white hover:bg-red-700',
      outline: 'text-gray-700 border-gray-300'
    }

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { Badge }
