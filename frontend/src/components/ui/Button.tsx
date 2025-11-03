import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  asChild?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled,
    asChild = false,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 shadow-sm",
      secondary: "text-gray-200 bg-space-700 border border-space-600 hover:bg-space-600 focus:ring-primary-500 shadow-sm",
      ghost: "text-gray-200 hover:text-gray-100 hover:bg-space-700 focus:ring-primary-500",
      danger: "text-white bg-danger-600 hover:bg-danger-700 focus:ring-danger-500 shadow-sm",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    };

    const isDisabled = disabled || loading;
    
    const buttonClasses = cn(
      baseClasses,
      variants[variant],
      sizes[size],
      className
    );

    // If asChild is true, render the child element with button styles
    if (asChild) {
      return React.cloneElement(children as React.ReactElement, {
        className: cn(buttonClasses, (children as React.ReactElement).props?.className),
        ...props
      });
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };