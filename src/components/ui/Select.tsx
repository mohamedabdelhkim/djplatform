import React, { type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly label?: string;
  readonly error?: string;
  readonly helperText?: string;
  readonly options?: readonly SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, id, className, disabled, options, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const errorId = selectId && error ? `${selectId}-error` : undefined;
    const helperId = selectId && helperText ? `${selectId}-helper` : undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block font-mono text-xs font-medium uppercase tracking-wider text-text-muted"
          >
            {label}
            {props.required && <span className="ml-1 text-accent">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            {...props}
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId || helperId}
            className={cn(
              "w-full h-11 px-3.5 bg-surface text-text-primary font-mono text-xs rounded-none border transition-colors duration-fast select-text appearance-none",
              error
                ? "border-signal focus:border-signal focus-visible:outline-2 focus-visible:outline-signal"
                : "border-border hover:border-text-muted focus:border-accent focus:bg-surface-active focus-visible:outline-2 focus-visible:outline-accent",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              className
            )}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-surface text-text-primary">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted" aria-hidden="true">
            <span className="font-mono text-[10px]">▼</span>
          </div>
        </div>

        {error && (
          <p id={errorId} role="alert" className="font-mono text-xs text-signal">
            [{error}]
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="font-mono text-xs text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
