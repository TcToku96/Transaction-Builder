// src/components/FileUploader.tsx
import React, { useId, useRef } from "react";

type Props = {
  label?: string;
  accept?: string;              // default ".csv"
  onFile: (file: File) => void; // parent handles parsing (Papa, etc.)
  id?: string;                  // optional override if you want a stable id
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
  const autoId = useId();                      // unique per instance (avoids id collisions)
  const inputId = id ?? `file-uploader-${autoId}`;

  const open = () => ref.current?.click();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    // Important: clear value so picking the same file later re-triggers onChange
    e.currentTarget.value = "";
    // DO NOT call ref.current?.click() here—this is what causes the re-open.
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
        // Never attach onClick to the input itself
      />
      <button type="button" onClick={open} disabled={disabled}>
        {label}
      </button>
    </div>
  );
}
