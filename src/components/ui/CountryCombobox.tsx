"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { COUNTRIES } from "@/utils/countries";

interface CountryComboboxProps {
  id: string;
  value: string;
  onChange: (country: string) => void;
  hasError?: boolean;
  errorId?: string;
}

export function CountryCombobox({
  id,
  value,
  onChange,
  hasError = false,
  errorId,
}: CountryComboboxProps) {
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

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q === value.trim().toLowerCase()) {
      return COUNTRIES;
    }
    return COUNTRIES.filter((c) => c.toLowerCase().includes(q));
  }, [query, value]);

  function selectCountry(country: string) {
    onChange(country);
    setQuery(country);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((prev) => Math.min(filteredCountries.length - 1, prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === "Enter" && open && filteredCountries[activeIndex]) {
      e.preventDefault();
      selectCountry(filteredCountries[activeIndex]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      setQuery(value);
    }
  }

  return (
    <div ref={containerRef} className="relative mt-1.5">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500"
          aria-hidden="true"
        />
        <input
          id={id}
          name="country"
          type="text"
          role="combobox"
          autoComplete="country-name"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-invalid={hasError}
          aria-describedby={errorId}
          value={inputValue}
          placeholder="Search country (e.g., India, UAE, UK)"
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
            const exact = COUNTRIES.find((c) => c.toLowerCase() === nextVal.trim().toLowerCase());
            if (exact) {
              onChange(exact);
            } else if (nextVal === "") {
              onChange("");
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
              aria-label="Clear country search"
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
          <button
            type="button"
            aria-label="Toggle country list"
            tabIndex={-1}
            onClick={() => {
              if (!open) setQuery(value);
              setOpen((prev) => !prev);
            }}
            className="rounded p-1 text-ink-500 hover:bg-ivory-200 hover:text-forest-900"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Country options"
          className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-ivory-300 bg-white py-1 shadow-xl"
        >
          {filteredCountries.length === 0 ? (
            <li className="px-3.5 py-2 text-xs text-ink-500">No matching country found</li>
          ) : (
            filteredCountries.map((country, idx) => {
              const selected = country === value;
              const active = idx === activeIndex;
              return (
                <li
                  key={country}
                  role="option"
                  aria-selected={selected}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectCountry(country);
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
                  {country}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
