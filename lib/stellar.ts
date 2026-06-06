"use client";

import { Horizon, TransactionBuilder } from "@stellar/stellar-sdk";
import freighterApi, {
  isConnected,
  signTransaction,
} from "@stellar/freighter-api";

const TESTNET_RPC_URL = "https://soroban-testnet.stellar.org";
const TESTNET_HORIZON_URL = "https://horizon-testnet.stellar.org";
const TESTNET_NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

export type NetworkConfig = {
  rpcUrl: string;
  networkPassphrase: string;
  horizonUrl: string;
};

export type SubmittedTransaction = {
  hash: string;
  successful: boolean;
  ledger?: number;
};

export function getNetworkConfig(): NetworkConfig {
  // Hardcode Testnet values so the app cannot drift onto Mainnet by accident.
  return {
    rpcUrl: TESTNET_RPC_URL,
    networkPassphrase: TESTNET_NETWORK_PASSPHRASE,
    horizonUrl: TESTNET_HORIZON_URL,
  };
}

export async function getFreighterPublicKey(): Promise<string> {
  // First confirm the extension is installed before requesting the account key.
  const connection = await isConnected();
  if (connection.error) {
    throw new Error(connection.error);
  }

  const connected =
    typeof connection === "boolean" ? connection : Boolean(connection.isConnected);

  if (!connected) {
    throw new Error("Freighter not found. Install the browser extension and refresh the page.");
  }

  // Support both the legacy `getPublicKey` shape and the current typed `getAddress` API.
  const legacyApi = freighterApi as typeof freighterApi & {
    getPublicKey?: () => Promise<
      { publicKey?: string; address?: string; error?: string } | string
    >;
  };

  const response = legacyApi.getPublicKey
    ? await legacyApi.getPublicKey()
    : await freighterApi.getAddress();

  if (typeof response !== "string" && response.error) {
    throw new Error(response.error);
  }

  const publicKey =
    typeof response === "string"
      ? response
      : ("publicKey" in response
          ? response.publicKey
          : response.address) ?? "";

  if (!publicKey) {
    throw new Error("Freighter did not return a public key.");
  }

  return publicKey;
}

export async function signAndSubmitTransaction(
  xdr: string,
): Promise<SubmittedTransaction> {
  const { horizonUrl, networkPassphrase } = getNetworkConfig();

  // Ask Freighter to sign the fully assembled transaction for Stellar Testnet.
  const signature = await signTransaction(xdr, {
    networkPassphrase,
  });

  if (signature.error) {
    throw new Error(signature.error);
  }

  if (!signature.signedTxXdr) {
    throw new Error("Freighter did not return a signed transaction.");
  }

  // Submit the signed envelope to Horizon, which relays it to the Testnet network.
  const horizon = new Horizon.Server(horizonUrl);
  const signedTransaction = TransactionBuilder.fromXDR(
    signature.signedTxXdr,
    networkPassphrase,
  );

  const response = await horizon.submitTransaction(signedTransaction);

  return {
    hash: response.hash,
    successful: response.successful,
    ledger: response.ledger,
  };
}

export async function fundWithFriendbot(publicKey: string): Promise<unknown> {
  // Friendbot is only available on Testnet and helps fund fresh wallets with test XLM.
  const response = await fetch(
    `https://friendbot.stellar.org/?addr=${encodeURIComponent(publicKey)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Friendbot funding failed.");
  }

  return response.json();
}
