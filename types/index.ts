export type TokenMetadata = {
  name: string;
  symbol: string;
  decimals: number;
  priceStroops: bigint;
};

export type RetirementCertificate = {
  id: bigint;
  retiree: string;
  beneficiary: string;
  amount: bigint;
  note: string;
  retiredAt: bigint;
};

export type TransactionResult = {
  hash: string;
  successful: boolean;
  ledger?: number;
};
