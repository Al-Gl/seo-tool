import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  helperText?: string;
  label?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, helperText, label, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-white mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "block w-full px-4 py-3 border border-space-600 bg-space-800/50 backdrop-blur-sm rounded-lg shadow-soft text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 focus:bg-space-800/70 transition-all duration-300 hover:border-space-500 resize-vertical min-h-[120px]",
            error && "border-danger-500 focus:ring-danger-500 focus:border-danger-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p className={cn(
            "mt-2 text-sm",
            error ? "text-danger-400" : "text-gray-300"
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };