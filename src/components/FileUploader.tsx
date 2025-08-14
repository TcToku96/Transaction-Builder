// src/components/FileUploader.tsx
import React from "react";

type Props = {
  label?: string;               // shown next to the input
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
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) onFile(file); // don't clear e.target.value here
  };

  return (
    <div className={className}>
      <label className="block text-sm mb-1">{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={onChange}
        disabled={disabled}
        className="
          block text-sm
          file:mr-4 file:rounded file:border-0
          file:bg-blue-600 file:text-white
          file:px-4 file:py-2
          file:cursor-pointer
          disabled:opacity-40
        "
        onClick={(e) => {
          // hard-stop any ancestor click logic from firing a second time
          e.stopPropagation();
        }}
      />
      <p className="mt-1 text-xs opacity-70">Accepted: {accept}</p>
    </div>
  );
}
