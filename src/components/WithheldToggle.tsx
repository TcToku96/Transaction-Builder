import React from 'react';

export default function WithheldToggle({
  enabled,
  setEnabled,
  dest,
  setDest,
}: {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  dest: string;
  setDest: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <span className="select-none">Generate Withheld Tokens file</span>
      </label>

      {enabled && (
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="Withheld destination wallet (0x…)"
          value={dest}
          onChange={(e) => setDest(e.target.value.trim())}
        />
      )}
    </div>
  );
}
