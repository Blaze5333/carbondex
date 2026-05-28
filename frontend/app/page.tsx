"use client";

import { useState } from "react";
import MainFeature from "@/components/MainFeature";
import WalletConnect from "@/components/WalletConnect";

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#020617_0%,#081423_38%,#030712_100%)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_bottom,rgba(15,118,110,0.18),transparent_34%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <header className="rounded-[32px] border border-white/10 bg-white/6 px-6 py-8 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-8">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300/80">
            Stellar Testnet
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                CarbonDEX
              </h1>
              <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
                Issue, trade, and retire tokenized carbon credits on Soroban. Each credit equals
                one tonne of CO₂ offset, and every retirement is anchored on-chain with a
                certificate-grade event trail.
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-100">
              <p>RPC: https://soroban-testnet.stellar.org</p>
              <p className="mt-2">Horizon: https://horizon-testnet.stellar.org</p>
            </div>
          </div>
        </header>

        <WalletConnect
          walletAddress={walletAddress}
          onConnected={setWalletAddress}
          onDisconnected={() => setWalletAddress(null)}
        />

        <MainFeature walletAddress={walletAddress} />
      </div>
    </main>
  );
}
