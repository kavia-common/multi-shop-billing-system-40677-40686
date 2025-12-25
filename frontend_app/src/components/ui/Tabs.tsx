"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * Tabs
 * Accessible tabs with keyboard navigation and roving focus.
 */

export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T | undefined
) {
  const [uncontrolled, setUncontrolled] = useState<T | undefined>(defaultValue);
  const value = controlled !== undefined ? controlled : uncontrolled;
  const setValue = (v: T) => {
    if (controlled === undefined) setUncontrolled(v);
  };
  return [value, setValue] as const;
}

// PUBLIC_INTERFACE
export function Tabs({ items, value, defaultValue, onValueChange }: TabsProps) {
  const firstEnabled = useMemo(
    () => items.find((i) => !i.disabled)?.value,
    [items]
  );
  const [current, setCurrent] = useControllableState<string | undefined>(
    value,
    defaultValue || firstEnabled
  );
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const panelIdPrefix = useId();

  useEffect(() => {
    if (value !== undefined) return; // controlled
    if (!current) setCurrent(firstEnabled!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstEnabled]);

  const setActive = (v: string) => {
    onValueChange?.(v);
    setCurrent(v);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const idx = items.findIndex((i) => i.value === current);
    if (idx < 0) return;
    let nextIdx = idx;
    if (e.key === "ArrowRight") {
      for (let i = 1; i <= items.length; i++) {
        const candidate = items[(idx + i) % items.length];
        if (!candidate.disabled) {
          nextIdx = (idx + i) % items.length;
          break;
        }
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      for (let i = 1; i <= items.length; i++) {
        const candidate = items[(idx - i + items.length) % items.length];
        if (!candidate.disabled) {
          nextIdx = (idx - i + items.length) % items.length;
          break;
        }
      }
      e.preventDefault();
    }
    if (nextIdx !== idx) {
      const next = items[nextIdx];
      setActive(next.value);
      tabsRef.current[nextIdx]?.focus();
    }
  };

  return (
    <div>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="inline-flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1"
        onKeyDown={onKeyDown}
      >
        {items.map((item, i) => {
          const selected = current === item.value;
          return (
            <button
              key={item.value}
              ref={(el) => {
                tabsRef.current[i] = el;
              }}
              role="tab"
              id={`${panelIdPrefix}-tab-${item.value}`}
              aria-selected={selected}
              aria-controls={`${panelIdPrefix}-panel-${item.value}`}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              className={`px-3 py-1.5 text-sm rounded-lg outline-none transition ${
                selected
                  ? "bg-white text-blue-700 shadow ring-1 ring-slate-200"
                  : "text-slate-700 hover:bg-white/70"
              } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => setActive(item.value)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="mt-3">
        {items.map((item) => {
          const selected = current === item.value;
          return (
            <div
              key={item.value}
              role="tabpanel"
              id={`${panelIdPrefix}-panel-${item.value}`}
              aria-labelledby={`${panelIdPrefix}-tab-${item.value}`}
              hidden={!selected}
            >
              {selected ? item.content : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
