import React, { type TextareaHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly label?: string;
  readonly error?: string;
  readonly helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, id, className, disabled, rows = 4, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const errorId = textareaId && error ? `${textareaId}-error` : undefined;
    const helperId = textareaId && helperText ? `${textareaId}-helper` : undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block font-mono text-xs font-medium uppercase tracking-wider text-text-muted"
          >
            {label}
            {props.required && <span className="ml-1 text-accent">*</span>}
          </label>
        )}

        <textarea
          {...props}
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId || helperId}
          className={cn(
            "w-full px-3.5 py-2.5 bg-surface text-text-primary font-body text-sm rounded-none border transition-colors duration-fast select-text resize-y",
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

Textarea.displayName = "Textarea";
