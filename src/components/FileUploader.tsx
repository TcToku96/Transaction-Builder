// src/components/FileUploader.tsx
import React from "react";

type Props = {
  label?: string;               // text shown on the file button
  accept?: string;              // default ".csv"
  onFile: (file: File) => void; // parent parses/handles the file
  className?: string;
  disabled?: boolean;
};

export default function FileUploader({
  label = "Choose CSV",
  accept = ".csv",
  onFile,
  className,
  disabled,
}: Props) {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    // Clear so selecting the same file again re-fires onChange
    e.currentTarget.value = "";
  };

  return (
    <div className={className}>
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        // Native file input (visible). No label, no programmatic click.
        className="
          block text-sm
          file:mr-4 file:rounded file:border-0
          file:bg-blue-600 file:text-white
          file:px-4 file:py-2
          file:cursor-pointer
          disabled:opacity-40
        "
      />
      {/* Optional helper text */}
      <p className="mt-1 text-xs opacity-70">Accepted: {accept}</p>
    </div>
  );
}
