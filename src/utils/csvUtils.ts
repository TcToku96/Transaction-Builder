/* ──────────────────────────────────────────────────────────────
   src/utils/csvUtils.ts — v3.4  (commas removed from ALL numbers)
   ────────────────────────────────────────────────────────────── */

import Papa from 'papaparse';
import Big from 'big.js';
import type {
  GrantRow,
  SafeRow,
  TransactionRow,
  ReportRow,
} from '../types';

/* ---------- constants & helpers ---------- */
const WALLET = /^0x[a-fA-F0-9]{40}$/;
const MISS   = new Set(['', '-', '~-', '`-', "'-"]);
const strip  = (s: string) => s.replace(/,/g, '');   // <- removes thousands commas

export const round10 = (v: any) =>
  new Big(v)
    .round(10, 0)
    .toFixed(10)
    .replace(/\.0+$/, '')
    .replace(/(\.[0-9]*?)0+$/, '$1');

/* CSV header map */
const map: Record<string, keyof GrantRow> = {
  'grant id': 'grantId',
  'grant type': 'grantType',
  'grant name': 'grantName',
  'recipient id': 'recipientId',
  'recipient name': 'recipientName',
  'active wallet address': 'walletAddress',
  token: 'tokenSymbol',
  'net tokens': 'netAmount',
  'tokens withheld': 'withheldAmount',
};

const parse = (f: File) =>
  new Promise<any[]>((res, rej) =>
    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (r) => res(r.data as any[]),
      error: rej,
    }),
  );

/* normalise grant rows */
const norm = (r: any) => {
  const o: any = {};
  for (const [k, v] of Object.entries(r)) {
    const c = map[k.trim().toLowerCase()];
    if (!c) continue;
    const val = String(v).trim();
    o[c] =
      c === 'netAmount' || c === 'withheldAmount'
        ? strip(val)
        : val;
  }
  return o as GrantRow;
};

/* builder options */
export interface BuildOpts {
  withheld: boolean;
  withheldDest: string;
}

/* main builder */
export async function buildAll(
  grantFile: File,
  safeFile: File,
  opt: BuildOpts,
) {
  const grants = (await parse(grantFile)).map(norm);
  const rawSafes = await parse(safeFile);

  /* flatten safes */
  const safes: SafeRow[] = [];
  rawSafes.forEach((r) => {
    const addr = (r['Wallet Address'] ?? r['wallet address'] ?? '').trim();
    const bal  = strip(
      (r['Current Balance'] ?? r['current balance'] ?? '').trim(),
    ); // commas removed
    const ids  = (r['Linked Grant IDs'] ?? r['linked grant ids'] ?? '').trim();
    if (!ids) return;
    ids
      .split(/[,;]/)
      .map((id: string) => id.trim())
      .filter(Boolean)
      .forEach((gid) =>
        safes.push({ safeAddress: addr, balance: bal, grantId: gid }),
      );
  });

  const byGrant: Record<string, SafeRow[]> = {};
  safes.forEach((s) => (byGrant[s.grantId] ??= []).push({ ...s }));

  const txs: TransactionRow[] = [];
  const rep: ReportRow[] = [];

  for (const g of grants) {
    const errs: string[] = [];

    const rawWallet = g.walletAddress.trim();
    const missingWallet = MISS.has(rawWallet);
    const invalidWallet = !missingWallet && !WALLET.test(rawWallet);

    if (missingWallet) errs.push('Missing wallet');
    if (invalidWallet) errs.push('Invalid wallet');
    if (!byGrant[g.grantId]?.length) errs.push('No linked safe');

    const netReq = new Big(strip(g.netAmount) || 0);
    const wthReq = new Big(strip(g.withheldAmount) || 0);

    let netRem = netReq;
    let wthRem = wthReq;

    /* allocate if no blocking errors */
    if (!errs.length) {
      for (const s of byGrant[g.grantId]) {
        let avail = new Big(s.balance);

        /* NET */
        const takeNet = avail.gt(netRem) ? netRem : avail;
        if (takeNet.gt(0)) {
          txs.push({
            from_safe: s.safeAddress,
            to_wallet: g.walletAddress,
            amount: round10(takeNet),
            grantId: g.grantId,
            kind: 'NET',
          });
          avail = avail.minus(takeNet);
          netRem = netRem.minus(takeNet);
        }

        /* WITHHELD */
        if (opt.withheld && wthRem.gt(0) && avail.gt(0)) {
          const takeW = avail.gt(wthRem) ? wthRem : avail;
          txs.push({
            from_safe: s.safeAddress,
            to_wallet: opt.withheldDest,
            amount: round10(takeW),
            grantId: g.grantId,
            kind: 'WITHHOLD',
          });
          avail = avail.minus(takeW);
          wthRem = wthRem.minus(takeW);
        }

        s.balance = avail.toString();
        if (netRem.eq(0) && (!opt.withheld || wthRem.eq(0))) break;
      }
    }

    /* shortage messages only if nothing else wrong */
    if (!errs.length && netRem.gt(0))
      errs.push(`Net short ${round10(netRem)}`);

    if (!errs.length && opt.withheld && wthRem.gt(0) && netRem.eq(0))
      errs.push(`Withheld short ${round10(wthRem)}`);

    /* push report row */
    rep.push({
      grantId: g.grantId,
      grantType: g.grantType,
      grantName: g.grantName,
      recipientId: g.recipientId,
      recipientName: g.recipientName,
      netRequested: round10(netReq),
      netDistributed: round10(netReq.minus(netRem)),
      wthRequested: round10(wthReq),
      wthDistributed: round10(wthReq.minus(wthRem)),
      errors: errs.join(', '),
    });
  }

  return { transactions: txs, reportRows: rep };
}

/* ---------- helpers for App ---------- */
export const toCsv = (rows: any[]) => Papa.unparse(rows, { quotes: true });

export const splitByBatch = (
  txs: TransactionRow[],
  bucket: (gId: string) => string,
) => {
  const out: Record<string, TransactionRow[]> = {};
  txs.forEach((t) => {
    const b = bucket(t.grantId);
    (out[b] ??= []).push(t);
  });
  return out;
};
