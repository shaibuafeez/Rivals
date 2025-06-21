import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function Alert({ children, className = '' }: AlertProps) {
  return (
    <div className={`p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ${className}`}>
      {children}
    </div>
  );
}

export function AlertDescription({ children, className = '' }: AlertDescriptionProps) {
  return (
    <div className={`text-sm text-blue-800 dark:text-blue-300 ${className}`}>
      {children}
    </div>
  );
}

export function AlertTitle({ children, className = '' }: AlertTitleProps) {
  return (
    <h4 className={`font-medium text-blue-900 dark:text-blue-200 mb-1 ${className}`}>
      {children}
    </h4>
  );
}