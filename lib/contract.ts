"use client";

import {
  Account,
  BASE_FEE,
  Contract,
  Horizon,
  Keypair,
  TransactionBuilder,
  nativeToScVal,
  rpc as SorobanRpc,
  scValToNative,
  type xdr,
} from "@stellar/stellar-sdk";
import {
  getNetworkConfig,
  signAndSubmitTransaction,
  type SubmittedTransaction,
} from "./stellar";
import type {
  RetirementCertificate,
  TokenMetadata,
  TransactionResult,
} from "@/types";

const { rpcUrl, networkPassphrase, horizonUrl } = getNetworkConfig();
const rpcServer = new SorobanRpc.Server(rpcUrl);
const horizonServer = new Horizon.Server(horizonUrl);
const READ_ONLY_SOURCE = Keypair.random().publicKey();

function getContractId(): string {
  const contractId = process.env.NEXT_PUBLIC_CONTRACT_ID;

  if (!contractId) {
    throw new Error("NEXT_PUBLIC_CONTRACT_ID is missing. Add it to frontend/.env.local.");
  }

  return contractId;
}

function getContract(): Contract {
  // Create a fresh contract wrapper so env changes are always reflected during development.
  return new Contract(getContractId());
}

function toI128(value: bigint): xdr.ScVal {
  return nativeToScVal(value, { type: "i128" });
}

function toU64(value: bigint): xdr.ScVal {
  return nativeToScVal(value, { type: "u64" });
}

function toAddress(value: string): xdr.ScVal {
  return nativeToScVal(value, { type: "address" });
}

function toText(value: string): xdr.ScVal {
  return nativeToScVal(value, { type: "string" });
}

function normalizeBigInt(value: unknown): bigint {
  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "number") {
    return BigInt(Math.trunc(value));
  }

  if (typeof value === "string") {
    return BigInt(value);
  }

  throw new Error(`Unable to normalize bigint value: ${String(value)}`);
}

function parseMetadata(raw: unknown): TokenMetadata {
  const value = raw as {
    name: string;
    symbol: string;
    decimals: number;
    price_stroops: bigint | number | string;
  };

  return {
    name: value.name,
    symbol: value.symbol,
    decimals: Number(value.decimals),
    priceStroops: normalizeBigInt(value.price_stroops),
  };
}

function parseCertificate(raw: unknown): RetirementCertificate {
  const value = raw as {
    id: bigint | number | string;
    retiree: string;
    beneficiary: string;
    amount: bigint | number | string;
    note: string;
    retired_at: bigint | number | string;
  };

  return {
    id: normalizeBigInt(value.id),
    retiree: String(value.retiree),
    beneficiary: value.beneficiary,
    amount: normalizeBigInt(value.amount),
    note: value.note,
    retiredAt: normalizeBigInt(value.retired_at),
  };
}

async function simulateRead(
  method: string,
  args: xdr.ScVal[] = [],
): Promise<unknown> {
  const contract = getContract();

  // Read calls only need a placeholder source account because they never get submitted.
  const source = new Account(READ_ONLY_SOURCE, "0");
  const transaction = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simulation = await rpcServer.simulateTransaction(transaction);
  if (SorobanRpc.Api.isSimulationError(simulation)) {
    throw new Error(simulation.error);
  }

  if (!simulation.result?.retval) {
    return null;
  }

  return scValToNative(simulation.result.retval);
}

async function waitForCompletion(hash: string): Promise<void> {
  // Poll Stellar RPC until the submitted transaction lands or fails.
  for (let attempt = 0; attempt < 15; attempt += 1) {
    const result = await rpcServer.getTransaction(hash);

    if (result.status === "SUCCESS") {
      return;
    }

    if (result.status === "FAILED") {
      throw new Error(
        String(result.resultXdr ?? "Transaction failed on Stellar Testnet."),
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  throw new Error("Timed out while waiting for transaction confirmation.");
}

async function simulateAndSubmit(
  publicKey: string,
  method: string,
  args: xdr.ScVal[] = [],
): Promise<TransactionResult> {
  const contract = getContract();

  // Writable Soroban calls must start from the caller's real account sequence number.
  const sourceAccount = await horizonServer.loadAccount(publicKey);
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simulation = await rpcServer.simulateTransaction(transaction);
  if (SorobanRpc.Api.isSimulationError(simulation)) {
    throw new Error(simulation.error);
  }

  // Apply Soroban footprint, resource fees, and auth requirements from simulation.
  const assembled = SorobanRpc.assembleTransaction(transaction, simulation).build();
  const submission: SubmittedTransaction = await signAndSubmitTransaction(
    assembled.toXDR(),
  );

  await waitForCompletion(submission.hash);

  return {
    hash: submission.hash,
    successful: submission.successful,
    ledger: submission.ledger,
  };
}

export async function initializeMarketplace(
  publicKey: string,
  name: string,
  symbol: string,
  priceStroops: bigint,
  initialSupply: bigint,
): Promise<TransactionResult> {
  return simulateAndSubmit(publicKey, "initialize", [
    toAddress(publicKey),
    toText(name),
    toText(symbol),
    toI128(priceStroops),
    toI128(initialSupply),
  ]);
}

export async function getAdmin(): Promise<string> {
  const result = await simulateRead("admin");
  return String(result);
}

export async function getMetadata(): Promise<TokenMetadata> {
  const result = await simulateRead("metadata");
  return parseMetadata(result);
}

export async function getPriceStroops(): Promise<bigint> {
  const result = await simulateRead("price_stroops");
  return normalizeBigInt(result);
}

export async function setPrice(
  publicKey: string,
  newPriceStroops: bigint,
): Promise<TransactionResult> {
  return simulateAndSubmit(publicKey, "set_price", [
    toAddress(publicKey),
    toI128(newPriceStroops),
  ]);
}

export async function mintCredits(
  publicKey: string,
  amount: bigint,
): Promise<TransactionResult> {
  return simulateAndSubmit(publicKey, "mint", [
    toAddress(publicKey),
    toI128(amount),
  ]);
}

export async function buyCredits(
  publicKey: string,
  amount: bigint,
): Promise<TransactionResult> {
  return simulateAndSubmit(publicKey, "buy", [
    toAddress(publicKey),
    toI128(amount),
  ]);
}

export async function retireCredits(
  publicKey: string,
  amount: bigint,
  beneficiary: string,
  note: string,
): Promise<TransactionResult> {
  return simulateAndSubmit(publicKey, "retire", [
    toAddress(publicKey),
    toI128(amount),
    toText(beneficiary),
    toText(note),
  ]);
}

export async function getBalance(owner: string): Promise<bigint> {
  const result = await simulateRead("balance", [toAddress(owner)]);
  return normalizeBigInt(result);
}

export async function getAvailableSupply(): Promise<bigint> {
  const result = await simulateRead("available_supply");
  return normalizeBigInt(result);
}

export async function getTotalSupply(): Promise<bigint> {
  const result = await simulateRead("total_supply");
  return normalizeBigInt(result);
}

export async function getTotalRetired(): Promise<bigint> {
  const result = await simulateRead("total_retired");
  return normalizeBigInt(result);
}

export async function getLifetimePurchased(owner: string): Promise<bigint> {
  const result = await simulateRead("lifetime_purchased", [toAddress(owner)]);
  return normalizeBigInt(result);
}

export async function getLifetimeRetired(owner: string): Promise<bigint> {
  const result = await simulateRead("lifetime_retired", [toAddress(owner)]);
  return normalizeBigInt(result);
}

export async function getLatestCertificateId(owner: string): Promise<bigint> {
  const result = await simulateRead("latest_certificate_id", [toAddress(owner)]);
  return normalizeBigInt(result);
}

export async function getCertificate(
  certificateId: bigint,
): Promise<RetirementCertificate> {
  const result = await simulateRead("get_certificate", [toU64(certificateId)]);
  return parseCertificate(result);
}
