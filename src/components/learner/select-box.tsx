'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * A compact dropdown. The browser's own <select> opens a list we can't size, which looks oversized
 * on phones, so this draws its own. Arrow keys move, Enter picks, and Escape or a click outside closes.
 */
export function SelectBox({
  id,
  value,
  onChange,
  options,
  align = 'left',
  className,
}: {
  /** Lets a <label htmlFor> name the button. */
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Which edge the open list lines up with; 'right' for a box at the right of the screen. */
  align?: 'left' | 'right';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    list.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    button.current?.focus();
  };

  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const items = [...(list.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])];
    const at = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      items[(at + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      items[e.key === 'Home' ? 0 : items.length - 1]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      button.current?.focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={root} className={cn('relative', className)}>
      <button
        ref={button}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          'flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border-2 bg-[#fffdf9] pl-3 pr-2.5 text-left font-body text-[15px] text-[#1c0e04] focus:outline-none lg:h-[50px] lg:pl-[17px] lg:pr-[15px] lg:text-[19px] lg:font-medium',
          open ? 'border-brand' : 'border-[#efe2d0] focus-visible:border-brand'
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          className={cn('h-[18px] w-[18px] shrink-0 text-[#7a6655] transition-transform lg:h-5 lg:w-5', open && 'rotate-180')}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          ref={list}
          id={listId}
          role="listbox"
          aria-labelledby={id}
          onKeyDown={onListKey}
          className={cn(
            'absolute top-full z-30 mt-1.5 max-h-72 w-max min-w-full max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-[#efe2d0] bg-[#fffdf9] p-1 shadow-lg shadow-[#1c0e04]/10',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {options.map((o) => {
            const active = o.value === selected?.value;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={active}
                tabIndex={-1}
                onClick={() => pick(o.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    pick(o.value);
                  }
                }}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 font-body text-[14px] outline-none focus:bg-[#fdf6ec] lg:px-3 lg:py-2.5 lg:text-[17px]',
                  active ? 'font-semibold text-brand' : 'text-[#3d2b1f]'
                )}
              >
                {o.label}
                {active && <Check className="h-4 w-4 shrink-0" strokeWidth={2.4} aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
