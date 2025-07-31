export interface GrantRow {
  grantId: string;
  grantType: string;
  grantName: string;
  recipientId: string;
  recipientName: string;
  walletAddress: string;
  tokenSymbol: string;
  netAmount: string;          // NET tokens
  withheldAmount: string;     // “Tokens Withheld” column
}

export interface SafeRow {
  safeAddress: string;
  balance: string;
  grantId: string;
}

export interface TransactionRow {
  from_safe: string;
  to_wallet: string;
  amount: string;
  grantId: string;
  kind: 'NET' | 'WITHHOLD';   // distinguishes file grouping
}

export interface ReportRow {
  grantId: string;
  grantType: string;
  grantName: string;
  recipientId: string;
  recipientName: string;
  netRequested: string;
  netDistributed: string;
  wthRequested: string;
  wthDistributed: string;
  errors: string;             // comma-separated list
}
