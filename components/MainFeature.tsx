"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import {
  buyCredits,
  getAdmin,
  getAvailableSupply,
  getBalance,
  getCertificate,
  getLatestCertificateId,
  getLifetimePurchased,
  getLifetimeRetired,
  getMetadata,
  getTotalRetired,
  getTotalSupply,
  initializeMarketplace,
  mintCredits,
  retireCredits,
  setPrice,
} from "@/lib/contract";
import type { RetirementCertificate, TokenMetadata } from "@/types";

const STROOPS_PER_XLM = 10_000_000n;

type MainFeatureProps = {
  walletAddress: string | null;
};

type DashboardState = {
  initialized: boolean;
  admin: string | null;
  metadata: TokenMetadata | null;
  availableSupply: bigint;
  totalSupply: bigint;
  totalRetired: bigint;
  balance: bigint;
  lifetimePurchased: bigint;
  lifetimeRetired: bigint;
  latestCertificate: RetirementCertificate | null;
};

type DashboardSnapshot = {
  nextState: DashboardState;
  nextPriceInput: string | null;
};

const EMPTY_STATE: DashboardState = {
  initialized: false,
  admin: null,
  metadata: null,
  availableSupply: 0n,
  totalSupply: 0n,
  totalRetired: 0n,
  balance: 0n,
  lifetimePurchased: 0n,
  lifetimeRetired: 0n,
  latestCertificate: null,
};

function formatCredits(value: bigint): string {
  return `${value.toString()} tCO2e`;
}

function formatXlm(stroops: bigint): string {
  const whole = stroops / STROOPS_PER_XLM;
  const fraction = stroops % STROOPS_PER_XLM;

  if (fraction === 0n) {
    return `${whole.toString()} XLM`;
  }

  return `${whole.toString()}.${fraction
    .toString()
    .padStart(7, "0")
    .replace(/0+$/, "")} XLM`;
}

function parseCredits(value: string): bigint {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error("Enter a carbon credit amount.");
  }

  const parsed = BigInt(trimmed);
  if (parsed <= 0n) {
    throw new Error("Amount must be greater than zero.");
  }

  return parsed;
}

function parseXlmToStroops(value: string): bigint {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error("Enter an XLM price.");
  }

  const [wholePart, fractionPart = ""] = trimmed.split(".");
  if (!/^\d+$/.test(wholePart || "0") || !/^\d*$/.test(fractionPart)) {
    throw new Error("Use a valid XLM amount, for example 2 or 2.5.");
  }

  const whole = BigInt(wholePart || "0") * STROOPS_PER_XLM;
  const fraction = BigInt((fractionPart + "0000000").slice(0, 7));
  const stroops = whole + fraction;

  if (stroops <= 0n) {
    throw new Error("XLM price must be greater than zero.");
  }

  return stroops;
}

function looksUninitialized(error: string): boolean {
  return (
    error.includes("ContractError(2)") ||
    error.includes("#2") ||
    error.includes("NotInitialized")
  );
}

function formatTimestamp(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleString();
}

export default function MainFeature({ walletAddress }: MainFeatureProps) {
  const [dashboard, setDashboard] = useState<DashboardState>(EMPTY_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const [initName, setInitName] = useState("CarbonDEX Credit");
  const [initSymbol, setInitSymbol] = useState("CO2");
  const [initPrice, setInitPrice] = useState("2.5");
  const [initSupply, setInitSupply] = useState("1000");
  const [mintAmount, setMintAmount] = useState("250");
  const [priceInput, setPriceInput] = useState("2.5");
  const [buyAmount, setBuyAmount] = useState("10");
  const [retireAmount, setRetireAmount] = useState("5");
  const [beneficiary, setBeneficiary] = useState("Acme Manufacturing");
  const [retirementNote, setRetirementNote] = useState("FY26 operational emissions");

  const isAdmin = walletAddress !== null && walletAddress === dashboard.admin;
  const unitPrice = dashboard.metadata?.priceStroops ?? 0n;

  const quotedBuyCost = useMemo(() => {
    try {
      const amount = parseCredits(buyAmount);
      return amount * unitPrice;
    } catch {
      return 0n;
    }
  }, [buyAmount, unitPrice]);

  const loadDashboardSnapshot = useCallback(
    async (currentWalletAddress: string | null): Promise<DashboardSnapshot> => {
      const admin = await getAdmin();
      const [metadata, availableSupply, totalSupply, totalRetired] = await Promise.all([
        getMetadata(),
        getAvailableSupply(),
        getTotalSupply(),
        getTotalRetired(),
      ]);

      const nextState: DashboardState = {
        initialized: true,
        admin,
        metadata,
        availableSupply,
        totalSupply,
        totalRetired,
        balance: 0n,
        lifetimePurchased: 0n,
        lifetimeRetired: 0n,
        latestCertificate: null,
      };

      if (currentWalletAddress) {
        const [balance, lifetimePurchased, lifetimeRetired, latestCertificateId] =
          await Promise.all([
            getBalance(currentWalletAddress),
            getLifetimePurchased(currentWalletAddress),
            getLifetimeRetired(currentWalletAddress),
            getLatestCertificateId(currentWalletAddress),
          ]);

        nextState.balance = balance;
        nextState.lifetimePurchased = lifetimePurchased;
        nextState.lifetimeRetired = lifetimeRetired;

        if (latestCertificateId > 0n) {
          nextState.latestCertificate = await getCertificate(latestCertificateId);
        }
      }

      return {
        nextState,
        nextPriceInput: formatXlm(metadata.priceStroops).replace(" XLM", ""),
      };
    },
    [],
  );

  const refreshDashboard = useCallback(
    async (showRefreshState: boolean) => {
      if (showRefreshState) {
        setIsRefreshing(true);
      }

      setError(null);

      try {
        const snapshot = await loadDashboardSnapshot(walletAddress);
        setDashboard(snapshot.nextState);
        if (snapshot.nextPriceInput) {
          setPriceInput(snapshot.nextPriceInput);
        }
      } catch (refreshError) {
        const message =
          refreshError instanceof Error
            ? refreshError.message
            : "Failed to load the marketplace.";

        if (looksUninitialized(message)) {
          setDashboard(EMPTY_STATE);
          setError(null);
        } else {
          setError(message);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [loadDashboardSnapshot, walletAddress],
  );

  useEffect(() => {
    let cancelled = false;

    const loadOnMountOrWalletChange = async () => {
      try {
        const snapshot = await loadDashboardSnapshot(walletAddress);
        if (cancelled) {
          return;
        }

        setError(null);
        setDashboard(snapshot.nextState);
        if (snapshot.nextPriceInput) {
          setPriceInput(snapshot.nextPriceInput);
        }
      } catch (refreshError) {
        if (cancelled) {
          return;
        }

        const message =
          refreshError instanceof Error
            ? refreshError.message
            : "Failed to load the marketplace.";

        if (looksUninitialized(message)) {
          setDashboard(EMPTY_STATE);
          setError(null);
        } else {
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadOnMountOrWalletChange();

    return () => {
      cancelled = true;
    };
  }, [loadDashboardSnapshot, walletAddress]);

  const rerenderDashboard = () => {
    startTransition(() => {
      void refreshDashboard(true);
    });
  };

  const runAction = async (actionKey: string, fn: () => Promise<void>) => {
    setBusyAction(actionKey);
    setActionMessage(null);
    setError(null);

    try {
      await fn();
      rerenderDashboard();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "The requested Stellar action failed.",
      );
    } finally {
      setBusyAction(null);
    }
  };

  const handleInitialize = async () => {
    if (!walletAddress) {
      setError("Connect a Freighter wallet before initializing the contract.");
      return;
    }

    await runAction("initialize", async () => {
      const result = await initializeMarketplace(
        walletAddress,
        initName.trim(),
        initSymbol.trim(),
        parseXlmToStroops(initPrice),
        parseCredits(initSupply),
      );

      setActionMessage(`Marketplace initialized. Transaction hash: ${result.hash}`);
    });
  };

  const handleMint = async () => {
    if (!walletAddress) {
      setError("Connect a Freighter wallet before minting credits.");
      return;
    }

    await runAction("mint", async () => {
      const result = await mintCredits(walletAddress, parseCredits(mintAmount));
      setActionMessage(`Credits minted successfully. Transaction hash: ${result.hash}`);
    });
  };

  const handleSetPrice = async () => {
    if (!walletAddress) {
      setError("Connect a Freighter wallet before updating price.");
      return;
    }

    await runAction("price", async () => {
      const result = await setPrice(walletAddress, parseXlmToStroops(priceInput));
      setActionMessage(`Price updated successfully. Transaction hash: ${result.hash}`);
    });
  };

  const handleBuy = async () => {
    if (!walletAddress) {
      setError("Connect a Freighter wallet before buying credits.");
      return;
    }

    await runAction("buy", async () => {
      const amount = parseCredits(buyAmount);
      const result = await buyCredits(walletAddress, amount);
      setActionMessage(
        `Purchased ${amount.toString()} credits for ${formatXlm(
          amount * unitPrice,
        )}. Transaction hash: ${result.hash}`,
      );
    });
  };

  const handleRetire = async () => {
    if (!walletAddress) {
      setError("Connect a Freighter wallet before retiring credits.");
      return;
    }

    await runAction("retire", async () => {
      const amount = parseCredits(retireAmount);
      const result = await retireCredits(
        walletAddress,
        amount,
        beneficiary.trim(),
        retirementNote.trim(),
      );
      setActionMessage(
        `Retirement recorded for ${amount.toString()} credits. Transaction hash: ${result.hash}`,
      );
    });
  };

  if (isLoading) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-10 text-center text-slate-200 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-emerald-300/30 border-t-emerald-200" />
        Loading CarbonDEX marketplace data from Stellar Testnet...
      </section>
    );
  }

  if (!dashboard.initialized) {
    return (
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.25),rgba(15,23,42,0.92)_55%)] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            Contract Setup
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Initialize CarbonDEX on Testnet
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            The deployed contract exists, but it has not been initialized yet. Connect the issuer
            wallet in Freighter, define the token metadata and opening inventory, then broadcast the
            setup transaction to Stellar Testnet.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200">
              <span>Token name</span>
              <input
                value={initName}
                onChange={(event) => setInitName(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-emerald-300/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span>Token symbol</span>
              <input
                value={initSymbol}
                onChange={(event) => setInitSymbol(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span>Price per credit (XLM)</span>
              <input
                value={initPrice}
                onChange={(event) => setInitPrice(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span>Initial supply (credits)</span>
              <input
                value={initSupply}
                onChange={(event) => setInitSupply(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/50"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleInitialize}
            disabled={busyAction === "initialize" || !walletAddress}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-emerald-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyAction === "initialize" ? "Initializing..." : "Initialize Marketplace"}
          </button>

          {!walletAddress ? (
            <p className="mt-4 text-sm text-amber-200">
              Connect the issuer wallet above to initialize the contract.
            </p>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">What initialization does</h3>
          <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
            <li>Stores the issuer address as the marketplace admin.</li>
            <li>Sets the token name, symbol, and initial credit price in stroops.</li>
            <li>Mints the opening inventory that companies can buy from immediately.</li>
            <li>Starts the retirement certificate counter at zero for future retirements.</li>
          </ul>
        </div>

        {actionMessage ? (
          <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {actionMessage}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Available credits",
            value: formatCredits(dashboard.availableSupply),
          },
          {
            label: "Market price",
            value: formatXlm(unitPrice),
          },
          {
            label: "Outstanding supply",
            value: formatCredits(dashboard.totalSupply),
          },
          {
            label: "Retired on-chain",
            value: formatCredits(dashboard.totalRetired),
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-[24px] border border-white/10 bg-white/6 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
          >
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{card.label}</p>
            <p className="mt-4 text-2xl font-semibold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),rgba(15,23,42,0.94)_50%)] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-sky-300/80">Marketplace</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">
                  {dashboard.metadata?.name}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Buy and retire on-chain carbon credits backed by Soroban contract state. Each
                  token represents one tonne of CO₂ offset.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-4 text-sm text-slate-200">
                <p>Symbol: {dashboard.metadata?.symbol}</p>
                <p className="mt-2 break-all text-slate-400">Issuer: {dashboard.admin}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/40 p-5">
                <p className="text-sm font-medium text-white">Buy credits</p>
                <p className="mt-2 text-sm text-slate-400">
                  Claim credits from the issuer inventory at the current Testnet quote.
                </p>
                <label className="mt-5 block space-y-2 text-sm text-slate-200">
                  <span>Amount (credits)</span>
                  <input
                    value={buyAmount}
                    onChange={(event) => setBuyAmount(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50"
                  />
                </label>
                <p className="mt-3 text-sm text-emerald-200">
                  Quote: {formatXlm(quotedBuyCost)}
                </p>
                <button
                  type="button"
                  onClick={handleBuy}
                  disabled={busyAction === "buy" || !walletAddress}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyAction === "buy" ? "Buying..." : "Buy Credits"}
                </button>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-slate-950/40 p-5">
                <p className="text-sm font-medium text-white">Retire credits</p>
                <p className="mt-2 text-sm text-slate-400">
                  Burn credits permanently and mint a verifiable retirement certificate on-chain.
                </p>
                <div className="mt-5 space-y-3">
                  <input
                    value={retireAmount}
                    onChange={(event) => setRetireAmount(event.target.value)}
                    placeholder="Amount (credits)"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/50"
                  />
                  <input
                    value={beneficiary}
                    onChange={(event) => setBeneficiary(event.target.value)}
                    placeholder="Beneficiary company name"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/50"
                  />
                  <textarea
                    value={retirementNote}
                    onChange={(event) => setRetirementNote(event.target.value)}
                    rows={3}
                    placeholder="Retirement note"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/50"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRetire}
                  disabled={busyAction === "retire" || !walletAddress}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-sky-300/40 bg-sky-300/10 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyAction === "retire" ? "Retiring..." : "Retire Credits"}
                </button>
              </div>
            </div>
          </div>

          {isAdmin ? (
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-300/80">Issuer Console</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">Admin controls</h3>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-slate-950/40 p-5">
                  <p className="text-sm font-medium text-white">Mint inventory</p>
                  <input
                    value={mintAmount}
                    onChange={(event) => setMintAmount(event.target.value)}
                    className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-amber-300/50"
                  />
                  <button
                    type="button"
                    onClick={handleMint}
                    disabled={busyAction === "mint"}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busyAction === "mint" ? "Minting..." : "Mint Credits"}
                  </button>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-slate-950/40 p-5">
                  <p className="text-sm font-medium text-white">Update price</p>
                  <input
                    value={priceInput}
                    onChange={(event) => setPriceInput(event.target.value)}
                    className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-amber-300/50"
                  />
                  <button
                    type="button"
                    onClick={handleSetPrice}
                    disabled={busyAction === "price"}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-amber-300/40 bg-amber-300/10 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busyAction === "price" ? "Updating..." : "Set Price"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
                  Account Snapshot
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-white">Your position</h3>
              </div>
              <button
                type="button"
                onClick={rerenderDashboard}
                className="rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-slate-300 transition hover:border-emerald-300/40 hover:text-white"
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {walletAddress ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-[22px] border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Wallet balance</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatCredits(dashboard.balance)}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-white/10 bg-slate-950/40 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Lifetime purchased
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {formatCredits(dashboard.lifetimePurchased)}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-slate-950/40 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Lifetime retired
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {formatCredits(dashboard.lifetimeRetired)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm leading-7 text-slate-300">
                Connect Freighter to view your balance, lifetime purchase history, and retirement
                certificate.
              </p>
            )}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.16),rgba(15,23,42,0.94)_55%)] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
              Retirement Certificate
            </p>
            {dashboard.latestCertificate ? (
              <>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  Certificate #{dashboard.latestCertificate.id.toString()}
                </h3>
                <div className="mt-6 space-y-4 text-sm text-slate-200">
                  <p>
                    <span className="text-slate-400">Retiree:</span>{" "}
                    {dashboard.latestCertificate.retiree}
                  </p>
                  <p>
                    <span className="text-slate-400">Beneficiary:</span>{" "}
                    {dashboard.latestCertificate.beneficiary}
                  </p>
                  <p>
                    <span className="text-slate-400">Amount:</span>{" "}
                    {formatCredits(dashboard.latestCertificate.amount)}
                  </p>
                  <p>
                    <span className="text-slate-400">Retired at:</span>{" "}
                    {formatTimestamp(dashboard.latestCertificate.retiredAt)}
                  </p>
                  <p>
                    <span className="text-slate-400">Note:</span>{" "}
                    {dashboard.latestCertificate.note}
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm leading-7 text-slate-300">
                No retirement certificate found for this wallet yet. Retire credits to mint an
                on-chain certificate and event log.
              </p>
            )}
          </div>
        </div>
      </div>

      {actionMessage ? (
        <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {actionMessage}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}
    </section>
  );
}
