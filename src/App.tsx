// src/App.tsx
import React, { useState } from "react";
import StepWrapper from "./components/StepWrapper";
import FileUploader from "./components/FileUploader";
import GrantBucketSelector, { BucketMap } from "./components/GrantBucketSelector";
import WithheldToggle from "./components/WithheldToggle";
import { buildAll, toCsv, splitByBatch } from "./utils/csvUtils";

/* download helper */
function dl(csv: string, name: string) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  /* file uploads */
  const [grantFile, setGrantFile] = useState<File | null>(null);
  const [safeFile, setSafeFile] = useState<File | null>(null);

  /* batching */
  const [bucketMap, setBucketMap] = useState<BucketMap>({});

  /* withheld-token feature */
  const [withheld, setWithheld] = useState(false);
  const [withheldDest, setWithheldDest] = useState("");

  /* outputs */
  const [batchFiles, setBatch] = useState<{ name: string; csv: string }[]>([]);
  const [withheldFile, setWithheldFile] = useState<{ name: string; csv: string } | null>(null);
  const [reportCsv, setReport] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  /* build button */
  const build = async () => {
    if (!grantFile || !safeFile) return;

    const { transactions, reportRows } = await buildAll(grantFile, safeFile, {
      withheld,
      withheldDest,
    });

    /* group NET txs by batch label */
    const batchFor = (gId: string) =>
      bucketMap[reportRows.find((r) => r.grantId === gId)!.grantType] ?? "Unbatched";

    const grouped = splitByBatch(
      transactions.filter((t) => t.kind === "NET"),
      batchFor
    );

    setBatch(
      Object.entries(grouped).map(([label, rows]) => ({
        name: `transactions_Batch${label}.csv`,
        csv: toCsv(rows),
      }))
    );

    /* withheld file (single) */
    if (withheld) {
      const wRows = transactions.filter((t) => t.kind === "WITHHOLD");
      setWithheldFile({
        name: "withheld_tokens.csv",
        csv: toCsv(wRows),
      });
    } else {
      setWithheldFile(null);
    }

    /* report & errors */
    setReport(toCsv(reportRows));
    setErrors(reportRows.filter((r) => r.errors).map((r) => `Grant ${r.grantId}: ${r.errors}`));
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Token Distribution Transaction Builder</h1>

      {/* STEP 1 */}
      <StepWrapper title="Step 1: Upload Release_Tax_Details CSV">
        <FileUploader
          label="Upload Release_Tax_Details CSV"
          onFile={async (file) => {
            setGrantFile(file);

            /* auto-extract grant-types for batch map */
            const txt = await file.text();
            const [hdr, ...data] = txt.split(/\r?\n/).filter(Boolean);
            const idx = hdr.toLowerCase().split(",").indexOf("grant type");
            if (idx === -1) return;

            const types = new Set<string>();
            data.forEach((l) => {
              const cells = l.split(",");
              if (cells[idx]) types.add(cells[idx]);
            });

            const init: BucketMap = {};
            types.forEach((t) => (init[t] = "1"));
            setBucketMap(init);
          }}
        />
        {grantFile && <p className="mt-2 text-sm text-green-700">{grantFile.name}</p>}
      </StepWrapper>

      {/* STEP 2 */}
      <StepWrapper title="Step 2: Upload Safe Balances - Wallet View CSV">
        <FileUploader label="Upload Wallet View CSV" onFile={setSafeFile} />
        {safeFile && <p className="mt-2 text-sm text-green-700">{safeFile.name}</p>}
      </StepWrapper>

      {/* STEP 3 */}
      {Object.keys(bucketMap).length > 0 && (
        <StepWrapper title="Step 3: Map Grant Types to Batches">
          <GrantBucketSelector
            grantTypes={Object.keys(bucketMap)}
            bucketMap={bucketMap}
            setBucketMap={setBucketMap}
          />
        </StepWrapper>
      )}

      {/* STEP 4 – Withheld‐token toggle */}
      <StepWrapper title="Optional: Withheld Tokens">
        <WithheldToggle
          enabled={withheld}
          setEnabled={setWithheld}
          dest={withheldDest}
          setDest={setWithheldDest}
        />
      </StepWrapper>

      {/* BUILD */}
      <div>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-40"
          disabled={!grantFile || !safeFile || (withheld && !withheldDest)}
          onClick={build}
        >
          Build Files
        </button>
      </div>

      {/* DOWNLOADS */}
      {batchFiles.length > 0 && (
        <StepWrapper title="Download Outputs">
          <div className="flex flex-wrap gap-4 mb-4">
            {batchFiles.map(({ name, csv }) => (
              <button
                key={name}
                className="px-4 py-2 rounded bg-green-600 text-white"
                onClick={() => dl(csv, name)}
              >
                {name}
              </button>
            ))}

            {withheldFile && (
              <button
                className="px-4 py-2 rounded bg-green-600 text-white"
                onClick={() => dl(withheldFile!.csv, withheldFile!.name)}
              >
                {withheldFile.name}
              </button>
            )}
          </div>

          <button
            className="px-4 py-2 rounded bg-purple-600 text-white"
            onClick={() => dl(reportCsv, "distribution_report.csv")}
          >
            Download Distribution Report CSV
          </button>
        </StepWrapper>
      )}

      {/* ERRORS (below downloads) */}
      {errors.length > 0 && (
        <StepWrapper title="Errors">
          <ul className="list-disc pl-4 text-red-600 text-sm">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </StepWrapper>
      )}
    </div>
  );
}
