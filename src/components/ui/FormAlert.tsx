import React from "react";
import { AlertCircle, Info } from "lucide-react";

interface FormAlertProps {
  message: string;
  isDuplicate?: boolean;
  compact?: boolean;
}

export function FormAlert({ message, isDuplicate = false, compact = false }: FormAlertProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`${compact ? "mb-4 px-3.5 py-2.5 text-xs" : "mb-5 px-4 py-3 text-sm"} flex items-start gap-2.5 rounded-xl border ${
        isDuplicate
          ? "border-amber-400 bg-amber-50 text-amber-950"
          : "border-red-300 bg-red-50 text-red-900"
      }`}
    >
      {isDuplicate ? (
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
      )}
      <span>{message}</span>
    </div>
  );
}
