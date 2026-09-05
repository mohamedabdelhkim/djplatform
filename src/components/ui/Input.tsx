import React, { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly error?: string;
  readonly helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const errorId = inputId && error ? `${inputId}-error` : undefined;
    const helperId = inputId && helperText ? `${inputId}-helper` : undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-mono text-xs font-medium uppercase tracking-wider text-text-muted"
          >
            {label}
            {props.required && <span className="ml-1 text-accent">*</span>}
          </label>
        )}

        <input
          {...props}
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId || helperId}
          className={cn(
            "w-full h-11 px-3.5 bg-surface text-text-primary font-body text-sm rounded-none border transition-colors duration-fast select-text",
            "placeholder:text-text-muted/50 placeholder:font-mono placeholder:text-xs",
            error
              ? "border-signal focus:border-signal focus-visible:outline-2 focus-visible:outline-signal"
              : "border-border hover:border-text-muted focus:border-accent focus:bg-surface-active focus-visible:outline-2 focus-visible:outline-accent",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            className
          )}
        />

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

Input.displayName = "Input";
