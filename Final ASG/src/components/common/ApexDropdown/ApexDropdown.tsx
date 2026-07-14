'use client';

import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface ApexDropdownProps {
  label: string;
  options?: Option[];
  onSelect: (value: string) => void;
  minWidth?: string;
}

export default function ApexDropdown({ label, options = [], onSelect, minWidth = '180px' }: ApexDropdownProps) {
  const isFullWidth = minWidth === '100%';
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            minWidth: isFullWidth ? '100%' : minWidth,
            width: isFullWidth ? '100%' : 'auto',
            padding: '8px 14px',
            backgroundColor: 'var(--apex-bg-surface)',
            border: '1.5px solid var(--apex-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--apex-text-white)',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            outline: 'none',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--apex-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 90, 20, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--apex-border)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
        >
          <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
          <ChevronDown size={14} style={{ color: 'var(--apex-text-muted)', flexShrink: 0 }} />
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          sideOffset={6}
          align="start"
          style={{
            minWidth: isFullWidth ? 'var(--radix-dropdown-menu-trigger-width)' : minWidth,
            width: isFullWidth ? 'var(--radix-dropdown-menu-trigger-width)' : 'auto',
            maxHeight: '320px',
            overflowY: 'auto',
            backgroundColor: 'var(--apex-bg-surface)',
            border: '1.5px solid var(--apex-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: '4px',
            zIndex: 9999,
            animation: 'apexDropdownIn 120ms ease',
          }}
        >
          {options.map(({ value, label: optLabel }) => (
            <DropdownMenuPrimitive.Item
              key={value}
              onSelect={() => onSelect(value)}
              style={{
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                color: 'var(--apex-text-white)',
                cursor: 'pointer',
                outline: 'none',
                userSelect: 'none',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--apex-bg-surface-elevated)';
                e.currentTarget.style.color = 'var(--apex-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--apex-text-white)';
              }}
            >
              {optLabel}
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
