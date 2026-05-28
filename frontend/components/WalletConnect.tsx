"use client";

import { useMemo, useState } from "react";
import { fundWithFriendbot, getFreighterPublicKey } from "@/lib/stellar";

type WalletConnectProps = {
  walletAddress: string | null;
  onConnected: (address: string) => void;
  onDisconnected: () => void;
};

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function WalletConnect({
  walletAddress,
  onConnected,
  onDisconnected,
}: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [friendbotMessage, setFriendbotMessage] = useState<string | null>(null);

  const label = useMemo(() => {
    if (!walletAddress) {
      return "Connect Wallet";
    }

    return truncateAddress(walletAddress);
  }, [walletAddress]);

  const handleConnect = async () => {
    setError(null);
    setFriendbotMessage(null);
    setIsConnecting(true);

    try {
      const publicKey = await getFreighterPublicKey();
      onConnected(publicKey);
    } catch (connectError) {
      setError(
        connectError instanceof Error
          ? connectError.message
          : "Failed to connect Freighter.",
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleFund = async () => {
    if (!walletAddress) {
      return;
    }

    setError(null);
    setFriendbotMessage(null);
    setIsFunding(true);

    try {
      await fundWithFriendbot(walletAddress);
      setFriendbotMessage("Friendbot funded your Testnet account.");
    } catch (fundingError) {
      setError(
        fundingError instanceof Error
          ? fundingError.message
          : "Friendbot funding failed.",
      );
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            Wallet
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {walletAddress ? "Freighter connected" : "Connect Freighter on Testnet"}
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            {walletAddress
              ? `Connected account: ${label}`
              : "Use your Freighter wallet to sign Soroban marketplace transactions."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={walletAddress ? onDisconnected : handleConnect}
            disabled={isConnecting}
            className="inline-flex min-w-40 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-400/10 px-5 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-200 hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isConnecting ? "Connecting..." : walletAddress ? "Disconnect" : "Connect Wallet"}
          </button>

          {walletAddress ? (
            <button
              type="button"
              onClick={handleFund}
              disabled={isFunding}
              className="inline-flex min-w-40 items-center justify-center rounded-full border border-sky-300/30 bg-sky-400/10 px-5 py-3 text-sm font-medium text-sky-100 transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isFunding ? "Funding..." : "Get Testnet XLM"}
            </button>
          ) : null}
        </div>
      </div>

      {friendbotMessage ? (
        <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {friendbotMessage}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}
    </section>
  );
}
