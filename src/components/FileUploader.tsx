// src/components/FileUploader.tsx
import React, { useId, useRef } from "react";

type Props = {
  label?: string;
  accept?: string;              // default ".csv"
  onFile: (file: File) => void; // parent handles parsing / state
  id?: string;                  // optional override for testability
  className?: string;
  disabled?: boolean;
};

export default function FileUploader({
  label = "Choose CSV",
  accept = ".csv",
  onFile,
  id,
  className,
  disabled,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const autoId = useId(); // unique per instance
  const inputId = id ?? `file-uploader-${autoId}`;

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    // Clear so picking the same file later fires onChange again
    e.currentTarget.value = "";
  };

  return (
    <div className={className}>
      <input
        id={inputId}
        ref={ref}
        type="file"
        accept={accept}
        onChange={handleChange}
        hidden
        // important: no onClick here
      />
      {/* Use label to open the native picker; no programmatic click */}
      <label
        htmlFor={inputId}
        className="inline-flex items-center justify-center px-4 py-2 rounded bg-blue-600 text-white cursor-pointer disabled:opacity-40"
        onClick={(e) => {
          // hard guard against any outer click handlers
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) {
            // forward to the input natively via label->htmlFor
            // no .click() call needed (prevents double-open)
            (e.currentTarget.ownerDocument?.getElementById(inputId) as HTMLInputElement)?.click();
          }
        }}
        aria-disabled={disabled || undefined}
      >
        {label}
      </label>
    </div>
  );
}
