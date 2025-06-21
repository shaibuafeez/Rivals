import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind CSS classes
 * This is a utility function that combines multiple class names and
 * ensures that Tailwind CSS classes are properly merged
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
