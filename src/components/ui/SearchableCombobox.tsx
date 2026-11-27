"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

interface SearchableComboboxProps {
  id: string;
  name: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder: string;
  listboxLabel: string;
  emptyMessage: string;
  clearAriaLabel: string;
  toggleAriaLabel: string;
  autoComplete?: string;
  allowCustomValue?: boolean;
  required?: boolean;
  hasError?: boolean;
  errorId?: string;
}

export function SearchableCombobox({
  id,
  name,
  value,
  options,
  onChange,
  placeholder,
  listboxLabel,
  emptyMessage,
  clearAriaLabel,
  toggleAriaLabel,
  autoComplete,
  allowCustomValue = false,
  required = false,
  hasError = false,
  errorId,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open, value]);

  const inputValue = open ? query : value;

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q === value.trim().toLowerCase()) {
      return options;
    }
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query, value]);

  function selectOption(option: string) {
    onChange(option);
    setQuery(option);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((prev) => Math.min(Math.max(0, filteredOptions.length - 1), prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === "Enter" && open && filteredOptions[activeIndex]) {
      e.preventDefault();
      selectOption(filteredOptions[activeIndex]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      setQuery(value);
    }
  }

  const showDropdown = open && (options.length > 0 || !allowCustomValue);

  return (
    <div ref={containerRef} className="relative mt-1.5">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500"
          aria-hidden="true"
        />
        <input
          id={id}
          name={name}
          type="text"
          role="combobox"
          required={required}
          autoComplete={autoComplete}
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-invalid={hasError}
          aria-describedby={errorId}
          value={inputValue}
          placeholder={placeholder}
          onFocus={() => {
            setQuery(value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onChange={(e) => {
            const nextVal = e.target.value;
            setQuery(nextVal);
            setOpen(true);
            setActiveIndex(0);

            if (allowCustomValue) {
              const exact = options.find((opt) => opt.toLowerCase() === nextVal.trim().toLowerCase());
              onChange(exact ?? nextVal);
            } else {
              const exact = options.find((opt) => opt.toLowerCase() === nextVal.trim().toLowerCase());
              if (exact) {
                onChange(exact);
              } else if (nextVal === "") {
                onChange("");
              }
            }
          }}
          onKeyDown={handleKeyDown}
          className={`w-full rounded-xl border bg-white py-2.5 pl-9 pr-14 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-forest-800 focus:outline-none focus:ring-2 focus:ring-gold-500/40 ${
            hasError ? "border-red-500" : "border-ivory-300"
          }`}
        />

        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
          {inputValue && (
            <button
              type="button"
              aria-label={clearAriaLabel}
              onClick={() => {
                setQuery("");
                onChange("");
                setOpen(true);
              }}
              className="rounded p-1 text-ink-500 hover:bg-ivory-200 hover:text-forest-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {options.length > 0 && (
            <button
              type="button"
              aria-label={toggleAriaLabel}
              tabIndex={-1}
              onClick={() => {
                if (!open) setQuery(value);
                setOpen((prev) => !prev);
              }}
              className="rounded p-1 text-ink-500 hover:bg-ivory-200 hover:text-forest-900"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={listboxLabel}
          className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-ivory-300 bg-white py-1 shadow-xl"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-3.5 py-2 text-xs text-ink-500">{emptyMessage}</li>
          ) : (
            filteredOptions.map((option, idx) => {
              const selected = option === value;
              const active = idx === activeIndex;
              return (
                <li
                  key={option}
                  role="option"
                  aria-selected={selected}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectOption(option);
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`cursor-pointer px-3.5 py-2 text-sm transition-colors ${
                    selected
                      ? "bg-forest-900 font-semibold text-gold-400"
                      : active
                      ? "bg-ivory-200 text-forest-900"
                      : "text-ink-800 hover:bg-ivory-100"
                  }`}
                >
                  {option}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
