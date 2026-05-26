'use client';

import { ReactNode } from 'react';

interface Props {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label: string;
  children?: ReactNode;
}

export default function RadioOption({ name, value, checked, onChange, label, children }: Props) {
  return (
    <label className="flex items-start gap-3 mb-3 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="mt-0.5 accent-blue-600"
      />
      <div className="flex flex-wrap items-center gap-1 text-sm text-gray-700">
        <span>{label}</span>
        {children}
      </div>
    </label>
  );
}
