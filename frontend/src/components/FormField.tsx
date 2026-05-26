'use client';

import { ReactNode } from 'react';

interface Props {
  label: string;
  htmlFor: string;
  error?: string;
  helperText?: string;
  children: ReactNode;
}

export default function FormField({ label, htmlFor, error, helperText, children }: Props) {
  return (
    <div className="mb-5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {helperText && <p className="text-xs text-gray-500 mb-1">{helperText}</p>}
      {children}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
