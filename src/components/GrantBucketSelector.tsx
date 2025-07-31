import React from 'react';

export interface BucketMap { [grantType: string]: string }

const batchOptions = Array.from({ length: 10 }, (_, i) => (i + 1).toString());
;

export default function GrantBucketSelector({
  grantTypes,
  bucketMap,
  setBucketMap,
}: {
  grantTypes: string[];
  bucketMap: BucketMap;
  setBucketMap: (m: BucketMap) => void;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="text-left p-2">Grant Type</th>
          <th className="text-left p-2">Batch Number</th>
        </tr>
      </thead>
      <tbody>
        {grantTypes.map((gt) => (
          <tr key={gt}>
            <td className="p-2 font-medium">{gt}</td>
            <td className="p-2">
              <select
                className="border rounded px-2 py-1"
                value={bucketMap[gt] ?? '1'}
                onChange={(e) =>
                  setBucketMap({ ...bucketMap, [gt]: e.target.value })
                }
              >
                {batchOptions.map((n) => (
                  <option key={n} value={n}>
                    Batch {n}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
