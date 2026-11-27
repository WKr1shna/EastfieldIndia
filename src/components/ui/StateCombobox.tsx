"use client";

import React from "react";
import { getStatesForCountry } from "@/utils/countries";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";

interface StateComboboxProps {
  id: string;
  country: string;
  value: string;
  onChange: (state: string) => void;
  hasError?: boolean;
  errorId?: string;
}

export function StateCombobox({
  id,
  country,
  value,
  onChange,
  hasError = false,
  errorId,
}: StateComboboxProps) {
  const states = getStatesForCountry(country);

  return (
    <SearchableCombobox
      id={id}
      name="state"
      value={value}
      options={states}
      onChange={onChange}
      placeholder={
        states.length > 0
          ? "Select or search state / province"
          : "Enter state, province, or region"
      }
      listboxLabel="State or province options"
      emptyMessage="Keep typing to enter a custom state or region"
      clearAriaLabel="Clear state selection"
      toggleAriaLabel="Toggle state list"
      autoComplete="address-level1"
      allowCustomValue
      required
      hasError={hasError}
      errorId={errorId}
    />
  );
}
