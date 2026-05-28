# Project Title
CarbonDEX is a full-stack carbon credit marketplace built on Stellar Testnet with a Soroban smart contract and a Next.js frontend. It lets an issuer create marketplace inventory, lets companies buy and hold tokenized carbon credits where `1 token = 1 tonne CO₂ offset`, and lets holders retire credits on-chain to generate a permanent retirement certificate backed by contract state and emitted contract events.

## Tech Stack
- Rust + Soroban SDK smart contract
- Next.js App Router
- TypeScript
- Tailwind CSS
- `@stellar/stellar-sdk`
- Freighter wallet

## Prerequisites
- Rust installed: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- Wasm target: `rustup target add wasm32-unknown-unknown`
- Stellar CLI: `cargo install --locked stellar-cli --features opt`
- Node.js 18+
- Freighter wallet browser extension installed from https://freighter.app

## Project Structure
```text
carbondex/
├── contracts/
│   ├── Cargo.toml                # Soroban contract manifest and Rust build settings
│   └── src/
│       └── lib.rs                # CarbonDEX marketplace contract, storage, events, and tests
├── frontend/
│   ├── .env.example              # Testnet-only frontend environment variables
│   ├── app/
│   │   ├── globals.css           # Tailwind import plus CarbonDEX global theme styles
│   │   ├── layout.tsx            # Root App Router layout and font configuration
│   │   └── page.tsx              # Main landing page wiring wallet + marketplace UI
│   ├── components/
│   │   ├── MainFeature.tsx       # Marketplace dashboard, buy, retire, init, and admin controls
│   │   └── WalletConnect.tsx     # Freighter connect/disconnect and Friendbot funding UI
│   ├── lib/
│   │   ├── contract.ts           # Soroban RPC contract calls and write-transaction assembly
│   │   └── stellar.ts            # Testnet config, Freighter helpers, Horizon submission, Friendbot
│   ├── types/
│   │   └── index.ts              # Shared TypeScript models for metadata, certificates, and tx results
│   ├── next-env.d.ts             # Next.js TypeScript environment declarations
│   ├── next.config.ts            # Next.js frontend config
│   ├── package.json              # Frontend dependencies and scripts
│   ├── postcss.config.mjs        # Tailwind PostCSS plugin config
│   ├── tailwind.config.ts        # Tailwind content config
│   └── tsconfig.json             # Frontend TypeScript configuration
└── README.md                     # End-to-end setup, deployment, and usage guide
```

## Step 1 — Build the Smart Contract
```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release
```
This compiles the Soroban contract to WebAssembly. The output file will be created at:

`contracts/target/wasm32-unknown-unknown/release/carbondex.wasm`

That `.wasm` file is what you deploy to Stellar Testnet in Step 3.

## Step 2 — Set Up a Testnet Identity
```bash
stellar keys generate --global my-key --network testnet
stellar keys address my-key
```
This creates a Testnet keypair named `my-key` in your Stellar CLI configuration and prepares it for Testnet use. With the Testnet flow, the account is funded through Friendbot automatically so you have XLM available for contract deployment fees.

## Step 3 — Deploy Contract to Testnet
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/carbondex.wasm \
  --source my-key \
  --network testnet
```
This uploads and deploys the CarbonDEX contract to Stellar Testnet. The command returns a Contract ID that starts with `C...`. Copy that Contract ID and keep it nearby because you will paste it into the frontend environment file in Step 5.

## Step 4 — Install Frontend Dependencies
```bash
cd ../frontend
npm install
```
This installs Next.js, the Stellar JavaScript SDK, the Freighter API package, Tailwind CSS, and TypeScript dependencies for the UI.

## Step 5 — Configure Environment Variables
```bash
cp .env.example .env.local
```
Open `frontend/.env.local` and paste the Contract ID from Step 3 into `NEXT_PUBLIC_CONTRACT_ID`. The other values are already preconfigured for Stellar Testnet:

- `NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015`
- `NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org`
- `NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org`

## Step 6 — Run the Frontend
```bash
npm run dev
```
Open http://localhost:3000

## Step 7 — Using the App
- Install Freighter at https://freighter.app and set it to Testnet mode.
  Settings → Network → Testnet
- Click `Connect Wallet` to connect your Freighter account.
- Click `Get Testnet XLM` if the wallet is new or unfunded.
- If the contract has not been initialized yet, use the initialization form to set:
  token name, token symbol, price per credit, and initial supply.
- If you are connected with the issuer wallet, use the issuer controls to mint more marketplace inventory or update the price.
- In the marketplace panel, enter a credit amount and click `Buy Credits`.
- After buying, your wallet balance and lifetime purchased totals update on the right-side dashboard.
- In the retirement panel, enter the amount to retire, the beneficiary company name, and a retirement note, then click `Retire Credits`.
- After the retirement transaction confirms, the latest retirement certificate appears with:
  certificate ID, retiree, beneficiary, retired amount, timestamp, and note.
- Click `Refresh` at any time to reload live contract data from Soroban RPC.

## Smart Contract Functions
- `initialize(admin: Address, name: String, symbol: String, price_stroops: i128, initial_supply: i128)`  
  Write. Initializes the contract, stores issuer metadata, sets the opening price, and creates the starting inventory.
- `admin()`  
  Read. Returns the issuer/admin address configured during initialization.
- `metadata()`  
  Read. Returns token name, symbol, decimals, and current price in stroops.
- `price_stroops()`  
  Read. Returns the current marketplace price for one carbon credit in stroops.
- `set_price(admin: Address, new_price_stroops: i128)`  
  Write. Admin-only function to update the price for future purchases.
- `mint(admin: Address, amount: i128)`  
  Write. Admin-only function that mints additional credits into marketplace inventory.
- `buy(buyer: Address, amount: i128)`  
  Write. Allocates available inventory to the buyer, increases their balance, and emits a purchase event.
- `retire(holder: Address, amount: i128, beneficiary: String, note: String)`  
  Write. Burns holder credits, stores a retirement certificate, updates retired totals, and emits a retirement event.
- `balance(owner: Address)`  
  Read. Returns the current credit balance held by the provided address.
- `available_supply()`  
  Read. Returns how many credits are still available for purchase from the issuer inventory.
- `total_supply()`  
  Read. Returns the current outstanding supply after accounting for retirements.
- `total_retired()`  
  Read. Returns the lifetime number of credits retired through the contract.
- `lifetime_purchased(buyer: Address)`  
  Read. Returns the cumulative credits ever purchased by the given address.
- `lifetime_retired(holder: Address)`  
  Read. Returns the cumulative credits ever retired by the given address.
- `latest_certificate_id(holder: Address)`  
  Read. Returns the newest retirement certificate ID for the given holder, or `0` if none exists.
- `get_certificate(certificate_id: u64)`  
  Read. Returns the stored retirement certificate by ID.

## Common Errors & Fixes
- `Transaction simulation failed` → contract not deployed or wrong `CONTRACT_ID` in `.env.local`
- `Freighter not found` → install the Freighter extension and refresh
- `Account not found` → click `Get Testnet XLM` to fund your wallet first
- `wasm32 target not found` → run: `rustup target add wasm32-unknown-unknown`

## Testnet Resources
- Stellar Testnet Explorer: https://stellar.expert/explorer/testnet
- Stellar Lab (manual transactions): https://lab.stellar.org
- Friendbot: https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY
