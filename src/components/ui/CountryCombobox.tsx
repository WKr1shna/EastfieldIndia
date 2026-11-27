"use client";

import React from "react";
import { COUNTRIES } from "@/utils/countries";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";

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
  return (
    <SearchableCombobox
      id={id}
      name="country"
      value={value}
      options={COUNTRIES}
      onChange={onChange}
      placeholder="Search country (e.g., India, UAE, UK)"
      listboxLabel="Country options"
      emptyMessage="No matching country found"
      clearAriaLabel="Clear country search"
      toggleAriaLabel="Toggle country list"
      autoComplete="country-name"
      hasError={hasError}
      errorId={errorId}
    />
  );
}
