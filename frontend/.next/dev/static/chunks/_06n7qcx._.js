(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/stellar.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fundWithFriendbot",
    ()=>fundWithFriendbot,
    "getFreighterPublicKey",
    ()=>getFreighterPublicKey,
    "getNetworkConfig",
    ()=>getNetworkConfig,
    "signAndSubmitTransaction",
    ()=>signAndSubmitTransaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@stellar/stellar-sdk/dist/stellar-sdk.min.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$freighter$2d$api$2f$build$2f$index$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@stellar/freighter-api/build/index.min.js [app-client] (ecmascript)");
"use client";
;
;
const TESTNET_RPC_URL = "https://soroban-testnet.stellar.org";
const TESTNET_HORIZON_URL = "https://horizon-testnet.stellar.org";
const TESTNET_NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
function getNetworkConfig() {
    // Hardcode Testnet values so the app cannot drift onto Mainnet by accident.
    return {
        rpcUrl: TESTNET_RPC_URL,
        networkPassphrase: TESTNET_NETWORK_PASSPHRASE,
        horizonUrl: TESTNET_HORIZON_URL
    };
}
async function getFreighterPublicKey() {
    // First confirm the extension is installed before requesting the account key.
    const connection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$freighter$2d$api$2f$build$2f$index$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isConnected"])();
    if (connection.error) {
        throw new Error(connection.error);
    }
    const connected = typeof connection === "boolean" ? connection : Boolean(connection.isConnected);
    if (!connected) {
        throw new Error("Freighter not found. Install the browser extension and refresh the page.");
    }
    // Support both the legacy `getPublicKey` shape and the current typed `getAddress` API.
    const legacyApi = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$freighter$2d$api$2f$build$2f$index$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
    const response = legacyApi.getPublicKey ? await legacyApi.getPublicKey() : await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$freighter$2d$api$2f$build$2f$index$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getAddress();
    if (typeof response !== "string" && response.error) {
        throw new Error(response.error);
    }
    const publicKey = typeof response === "string" ? response : ("publicKey" in response ? response.publicKey : response.address) ?? "";
    if (!publicKey) {
        throw new Error("Freighter did not return a public key.");
    }
    return publicKey;
}
async function signAndSubmitTransaction(xdr) {
    const { horizonUrl, networkPassphrase } = getNetworkConfig();
    // Ask Freighter to sign the fully assembled transaction for Stellar Testnet.
    const signature = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$freighter$2d$api$2f$build$2f$index$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signTransaction"])(xdr, {
        networkPassphrase
    });
    if (signature.error) {
        throw new Error(signature.error);
    }
    if (!signature.signedTxXdr) {
        throw new Error("Freighter did not return a signed transaction.");
    }
    // Submit the signed envelope to Horizon, which relays it to the Testnet network.
    const horizon = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Horizon"].Server(horizonUrl);
    const signedTransaction = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TransactionBuilder"].fromXDR(signature.signedTxXdr, networkPassphrase);
    const response = await horizon.submitTransaction(signedTransaction);
    return {
        hash: response.hash,
        successful: response.successful,
        ledger: response.ledger
    };
}
async function fundWithFriendbot(publicKey) {
    // Friendbot is only available on Testnet and helps fund fresh wallets with test XLM.
    const response = await fetch(`https://friendbot.stellar.org/?addr=${encodeURIComponent(publicKey)}`, {
        method: "GET",
        headers: {
            Accept: "application/json"
        }
    });
    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Friendbot funding failed.");
    }
    return response.json();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/contract.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buyCredits",
    ()=>buyCredits,
    "getAdmin",
    ()=>getAdmin,
    "getAvailableSupply",
    ()=>getAvailableSupply,
    "getBalance",
    ()=>getBalance,
    "getCertificate",
    ()=>getCertificate,
    "getLatestCertificateId",
    ()=>getLatestCertificateId,
    "getLifetimePurchased",
    ()=>getLifetimePurchased,
    "getLifetimeRetired",
    ()=>getLifetimeRetired,
    "getMetadata",
    ()=>getMetadata,
    "getPriceStroops",
    ()=>getPriceStroops,
    "getTotalRetired",
    ()=>getTotalRetired,
    "getTotalSupply",
    ()=>getTotalSupply,
    "initializeMarketplace",
    ()=>initializeMarketplace,
    "mintCredits",
    ()=>mintCredits,
    "retireCredits",
    ()=>retireCredits,
    "setPrice",
    ()=>setPrice
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@stellar/stellar-sdk/dist/stellar-sdk.min.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stellar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/stellar.ts [app-client] (ecmascript)");
"use client";
;
;
const { rpcUrl, networkPassphrase, horizonUrl } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stellar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getNetworkConfig"])();
const rpcServer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rpc"].Server(rpcUrl);
const horizonServer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Horizon"].Server(horizonUrl);
const READ_ONLY_SOURCE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Keypair"].random().publicKey();
function getContractId() {
    const contractId = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_CONTRACT_ID;
    if (!contractId) {
        throw new Error("NEXT_PUBLIC_CONTRACT_ID is missing. Add it to frontend/.env.local.");
    }
    return contractId;
}
function getContract() {
    // Create a fresh contract wrapper so env changes are always reflected during development.
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Contract"](getContractId());
}
function toI128(value) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nativeToScVal"])(value, {
        type: "i128"
    });
}
function toU64(value) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nativeToScVal"])(value, {
        type: "u64"
    });
}
function toAddress(value) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nativeToScVal"])(value, {
        type: "address"
    });
}
function toText(value) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nativeToScVal"])(value, {
        type: "string"
    });
}
function normalizeBigInt(value) {
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
function parseMetadata(raw) {
    const value = raw;
    return {
        name: value.name,
        symbol: value.symbol,
        decimals: Number(value.decimals),
        priceStroops: normalizeBigInt(value.price_stroops)
    };
}
function parseCertificate(raw) {
    const value = raw;
    return {
        id: normalizeBigInt(value.id),
        retiree: String(value.retiree),
        beneficiary: value.beneficiary,
        amount: normalizeBigInt(value.amount),
        note: value.note,
        retiredAt: normalizeBigInt(value.retired_at)
    };
}
async function simulateRead(method, args = []) {
    const contract = getContract();
    // Read calls only need a placeholder source account because they never get submitted.
    const source = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Account"](READ_ONLY_SOURCE, "0");
    const transaction = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TransactionBuilder"](source, {
        fee: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BASE_FEE"],
        networkPassphrase
    }).addOperation(contract.call(method, ...args)).setTimeout(30).build();
    const simulation = await rpcServer.simulateTransaction(transaction);
    if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rpc"].Api.isSimulationError(simulation)) {
        throw new Error(simulation.error);
    }
    if (!simulation.result?.retval) {
        return null;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scValToNative"])(simulation.result.retval);
}
async function waitForCompletion(hash) {
    // Poll Stellar RPC until the submitted transaction lands or fails.
    for(let attempt = 0; attempt < 15; attempt += 1){
        const result = await rpcServer.getTransaction(hash);
        if (result.status === "SUCCESS") {
            return;
        }
        if (result.status === "FAILED") {
            throw new Error(String(result.resultXdr ?? "Transaction failed on Stellar Testnet."));
        }
        await new Promise((resolve)=>setTimeout(resolve, 1500));
    }
    throw new Error("Timed out while waiting for transaction confirmation.");
}
async function simulateAndSubmit(publicKey, method, args = []) {
    const contract = getContract();
    // Writable Soroban calls must start from the caller's real account sequence number.
    const sourceAccount = await horizonServer.loadAccount(publicKey);
    const transaction = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TransactionBuilder"](sourceAccount, {
        fee: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BASE_FEE"],
        networkPassphrase
    }).addOperation(contract.call(method, ...args)).setTimeout(30).build();
    const simulation = await rpcServer.simulateTransaction(transaction);
    if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rpc"].Api.isSimulationError(simulation)) {
        throw new Error(simulation.error);
    }
    // Apply Soroban footprint, resource fees, and auth requirements from simulation.
    const assembled = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$stellar$2f$stellar$2d$sdk$2f$dist$2f$stellar$2d$sdk$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rpc"].assembleTransaction(transaction, simulation).build();
    const submission = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stellar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signAndSubmitTransaction"])(assembled.toXDR());
    await waitForCompletion(submission.hash);
    return {
        hash: submission.hash,
        successful: submission.successful,
        ledger: submission.ledger
    };
}
async function initializeMarketplace(publicKey, name, symbol, priceStroops, initialSupply) {
    return simulateAndSubmit(publicKey, "initialize", [
        toAddress(publicKey),
        toText(name),
        toText(symbol),
        toI128(priceStroops),
        toI128(initialSupply)
    ]);
}
async function getAdmin() {
    const result = await simulateRead("admin");
    return String(result);
}
async function getMetadata() {
    const result = await simulateRead("metadata");
    return parseMetadata(result);
}
async function getPriceStroops() {
    const result = await simulateRead("price_stroops");
    return normalizeBigInt(result);
}
async function setPrice(publicKey, newPriceStroops) {
    return simulateAndSubmit(publicKey, "set_price", [
        toAddress(publicKey),
        toI128(newPriceStroops)
    ]);
}
async function mintCredits(publicKey, amount) {
    return simulateAndSubmit(publicKey, "mint", [
        toAddress(publicKey),
        toI128(amount)
    ]);
}
async function buyCredits(publicKey, amount) {
    return simulateAndSubmit(publicKey, "buy", [
        toAddress(publicKey),
        toI128(amount)
    ]);
}
async function retireCredits(publicKey, amount, beneficiary, note) {
    return simulateAndSubmit(publicKey, "retire", [
        toAddress(publicKey),
        toI128(amount),
        toText(beneficiary),
        toText(note)
    ]);
}
async function getBalance(owner) {
    const result = await simulateRead("balance", [
        toAddress(owner)
    ]);
    return normalizeBigInt(result);
}
async function getAvailableSupply() {
    const result = await simulateRead("available_supply");
    return normalizeBigInt(result);
}
async function getTotalSupply() {
    const result = await simulateRead("total_supply");
    return normalizeBigInt(result);
}
async function getTotalRetired() {
    const result = await simulateRead("total_retired");
    return normalizeBigInt(result);
}
async function getLifetimePurchased(owner) {
    const result = await simulateRead("lifetime_purchased", [
        toAddress(owner)
    ]);
    return normalizeBigInt(result);
}
async function getLifetimeRetired(owner) {
    const result = await simulateRead("lifetime_retired", [
        toAddress(owner)
    ]);
    return normalizeBigInt(result);
}
async function getLatestCertificateId(owner) {
    const result = await simulateRead("latest_certificate_id", [
        toAddress(owner)
    ]);
    return normalizeBigInt(result);
}
async function getCertificate(certificateId) {
    const result = await simulateRead("get_certificate", [
        toU64(certificateId)
    ]);
    return parseCertificate(result);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/MainFeature.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MainFeature
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contract$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/contract.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const STROOPS_PER_XLM = 10_000_000n;
const EMPTY_STATE = {
    initialized: false,
    admin: null,
    metadata: null,
    availableSupply: 0n,
    totalSupply: 0n,
    totalRetired: 0n,
    balance: 0n,
    lifetimePurchased: 0n,
    lifetimeRetired: 0n,
    latestCertificate: null
};
function formatCredits(value) {
    return `${value.toString()} tCO2e`;
}
function formatXlm(stroops) {
    const whole = stroops / STROOPS_PER_XLM;
    const fraction = stroops % STROOPS_PER_XLM;
    if (fraction === 0n) {
        return `${whole.toString()} XLM`;
    }
    return `${whole.toString()}.${fraction.toString().padStart(7, "0").replace(/0+$/, "")} XLM`;
}
function parseCredits(value) {
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
function parseXlmToStroops(value) {
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
function looksUninitialized(error) {
    return error.includes("ContractError(2)") || error.includes("#2") || error.includes("NotInitialized");
}
function formatTimestamp(timestamp) {
    return new Date(Number(timestamp) * 1000).toLocaleString();
}
function MainFeature({ walletAddress }) {
    _s();
    const [dashboard, setDashboard] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(EMPTY_STATE);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isRefreshing, setIsRefreshing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [actionMessage, setActionMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [busyAction, setBusyAction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [initName, setInitName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("CarbonDEX Credit");
    const [initSymbol, setInitSymbol] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("CO2");
    const [initPrice, setInitPrice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("2.5");
    const [initSupply, setInitSupply] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("1000");
    const [mintAmount, setMintAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("250");
    const [priceInput, setPriceInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("2.5");
    const [buyAmount, setBuyAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("10");
    const [retireAmount, setRetireAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("5");
    const [beneficiary, setBeneficiary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("Acme Manufacturing");
    const [retirementNote, setRetirementNote] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("FY26 operational emissions");
    const isAdmin = walletAddress !== null && walletAddress === dashboard.admin;
    const unitPrice = dashboard.metadata?.priceStroops ?? 0n;
    const quotedBuyCost = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MainFeature.useMemo[quotedBuyCost]": ()=>{
            try {
                const amount = parseCredits(buyAmount);
                return amount * unitPrice;
            } catch  {
                return 0n;
            }
        }
    }["MainFeature.useMemo[quotedBuyCost]"], [
        buyAmount,
        unitPrice
    ]);
    const loadDashboardSnapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MainFeature.useCallback[loadDashboardSnapshot]": async (currentWalletAddress)=>{
            const admin = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contract$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAdmin"])();
            const [metadata, availableSupply, totalSupply, totalRetired] = await Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contract$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMetadata"])(),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contract$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAvailableSupply"])(),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contract$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTotalSupply"])(),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contract$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTotalRetired"])()
            ]);
            const nextState = {
                initialized: true,
                admin,
                metadata,
                availableSupply,
                totalSupply,
                totalRetired,
                balance: 0n,
                lifetimePurchased: 0n,
                lifetimeRetired: 0n,
                latestCertificate: null
            };
            if (currentWalletAddress) {
                const [balance, lifetimePurchased, lifetimeRetired, latestCertificateId] = await Promise.all([
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contract$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBalance"])(currentWalletAddress),
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contract$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLifetimePurchased"])(currentWalletAddress),
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contract$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLifetimeRetired"])(currentWalletAddress),
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contract$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLatestCertificateId"])(currentWalletAddress)
                ]);
                nextState.balance = balance;
                nextState.lifetimePurchased = lifetimePurchased;
                nextState.lifetimeRetired = lifetimeRetired;
                if (latestCertificateId > 0n) {
                    nextState.latestCertificate = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contract$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCertificate"])(latestCertificateId);
                }
            }
            return {
                nextState,
                nextPriceInput: formatXlm(metadata.priceStroops).replace(" XLM", "")
            };
        }
    }["MainFeature.useCallback[loadDashboardSnapshot]"], []);
    const refreshDashboard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MainFeature.useCallback[refreshDashboard]": async (showRefreshState)=>{
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
                const message = refreshError instanceof Error ? refreshError.message : "Failed to load the marketplace.";
                if (looksUninitialized(message)) {
                    setDashboard(EMPTY_STATE);
                    setError(null);
                } else {
                    setError(message);
                }
            } finally{
                setIsLoading(false);
                setIsRefreshing(false);
            }
        }
    }["MainFeature.useCallback[refreshDashboard]"], [
        loadDashboardSnapshot,
        walletAddress
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MainFeature.useEffect": ()=>{
            let cancelled = false;
            const loadOnMountOrWalletChange = {
                "MainFeature.useEffect.loadOnMountOrWalletChange": async ()=>{
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
                        const message = refreshError instanceof Error ? refreshError.message : "Failed to load the marketplace.";
                        if (looksUninitialized(message)) {
                            setDashboard(EMPTY_STATE);
                            setError(null);
                        } else {
                            setError(message);
                        }
                    } finally{
                        if (!cancelled) {
                            setIsLoading(false);
                        }
                    }
                }
            }["MainFeature.useEffect.loadOnMountOrWalletChange"];
            void loadOnMountOrWalletChange();
            return ({
                "MainFeature.useEffect": ()=>{
                    cancelled = true;
                }
            })["MainFeature.useEffect"];
        }
    }["MainFeature.useEffect"], [
        loadDashboardSnapshot,
        walletAddress
    ]);
    const rerenderDashboard = ()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startTransition"])(()=>{
            void refreshDashboard(true);
        });
    };
    const runAction = async (actionKey, fn)=>{
        setBusyAction(actionKey);
        setActionMessage(null);
        setError(null);
        try {
            await fn();
            rerenderDashboard();
        } catch (actionError) {
            setError(actionError instanceof Error ? actionError.message : "The requested Stellar action failed.");
        } finally{
            setBusyAction(null);
        }
    };
    const handleInitialize = async ()=>{
        if (!walletAddress) {
            setError("Connect a Freighter wallet before initializing the contract.");
            return;
        }
        await runAction("initialize", async ()=>{
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contract$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initializeMarketplace"])(walletAddress, initName.trim(), initSymbol.trim(), parseXlmToStroops(initPrice), parseCredits(initSupply));
            setActionMessage(`Marketplace initialized. Transaction hash: ${result.hash}`);
        });
    };
    const handleMint = async ()=>{
        if (!walletAddress) {
            setError("Connect a Freighter wallet before minting credits.");
            return;
        }
        await runAction("mint", async ()=>{
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contract$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mintCredits"])(walletAddress, parseCredits(mintAmount));
            setActionMessage(`Credits minted successfully. Transaction hash: ${result.hash}`);
        });
    };
    const handleSetPrice = async ()=>{
        if (!walletAddress) {
            setError("Connect a Freighter wallet before updating price.");
            return;
        }
        await runAction("price", async ()=>{
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contract$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setPrice"])(walletAddress, parseXlmToStroops(priceInput));
            setActionMessage(`Price updated successfully. Transaction hash: ${result.hash}`);
        });
    };
    const handleBuy = async ()=>{
        if (!walletAddress) {
            setError("Connect a Freighter wallet before buying credits.");
            return;
        }
        await runAction("buy", async ()=>{
            const amount = parseCredits(buyAmount);
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contract$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buyCredits"])(walletAddress, amount);
            setActionMessage(`Purchased ${amount.toString()} credits for ${formatXlm(amount * unitPrice)}. Transaction hash: ${result.hash}`);
        });
    };
    const handleRetire = async ()=>{
        if (!walletAddress) {
            setError("Connect a Freighter wallet before retiring credits.");
            return;
        }
        await runAction("retire", async ()=>{
            const amount = parseCredits(retireAmount);
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contract$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["retireCredits"])(walletAddress, amount, beneficiary.trim(), retirementNote.trim());
            setActionMessage(`Retirement recorded for ${amount.toString()} credits. Transaction hash: ${result.hash}`);
        });
    };
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: "rounded-[28px] border border-white/10 bg-white/6 p-10 text-center text-slate-200 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-emerald-300/30 border-t-emerald-200"
                }, void 0, false, {
                    fileName: "[project]/components/MainFeature.tsx",
                    lineNumber: 395,
                    columnNumber: 9
                }, this),
                "Loading CarbonDEX marketplace data from Stellar Testnet..."
            ]
        }, void 0, true, {
            fileName: "[project]/components/MainFeature.tsx",
            lineNumber: 394,
            columnNumber: 7
        }, this);
    }
    if (!dashboard.initialized) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: "grid gap-6 lg:grid-cols-[1.2fr_0.8fr]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.25),rgba(15,23,42,0.92)_55%)] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs uppercase tracking-[0.35em] text-emerald-300/80",
                            children: "Contract Setup"
                        }, void 0, false, {
                            fileName: "[project]/components/MainFeature.tsx",
                            lineNumber: 405,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "mt-3 text-3xl font-semibold text-white",
                            children: "Initialize CarbonDEX on Testnet"
                        }, void 0, false, {
                            fileName: "[project]/components/MainFeature.tsx",
                            lineNumber: 408,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-3 max-w-2xl text-sm leading-7 text-slate-300",
                            children: "The deployed contract exists, but it has not been initialized yet. Connect the issuer wallet in Freighter, define the token metadata and opening inventory, then broadcast the setup transaction to Stellar Testnet."
                        }, void 0, false, {
                            fileName: "[project]/components/MainFeature.tsx",
                            lineNumber: 411,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-8 grid gap-4 sm:grid-cols-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "space-y-2 text-sm text-slate-200",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Token name"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MainFeature.tsx",
                                            lineNumber: 419,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            value: initName,
                                            onChange: (event)=>setInitName(event.target.value),
                                            className: "w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-emerald-300/50"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MainFeature.tsx",
                                            lineNumber: 420,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/MainFeature.tsx",
                                    lineNumber: 418,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "space-y-2 text-sm text-slate-200",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Token symbol"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MainFeature.tsx",
                                            lineNumber: 427,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            value: initSymbol,
                                            onChange: (event)=>setInitSymbol(event.target.value),
                                            className: "w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/50"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MainFeature.tsx",
                                            lineNumber: 428,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/MainFeature.tsx",
                                    lineNumber: 426,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "space-y-2 text-sm text-slate-200",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Price per credit (XLM)"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MainFeature.tsx",
                                            lineNumber: 435,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            value: initPrice,
                                            onChange: (event)=>setInitPrice(event.target.value),
                                            className: "w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/50"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MainFeature.tsx",
                                            lineNumber: 436,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/MainFeature.tsx",
                                    lineNumber: 434,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "space-y-2 text-sm text-slate-200",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Initial supply (credits)"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MainFeature.tsx",
                                            lineNumber: 443,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            value: initSupply,
                                            onChange: (event)=>setInitSupply(event.target.value),
                                            className: "w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/50"
                                        }, void 0, false, {
                                            fileName: "[project]/components/MainFeature.tsx",
                                            lineNumber: 444,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/MainFeature.tsx",
                                    lineNumber: 442,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/MainFeature.tsx",
                            lineNumber: 417,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: handleInitialize,
                            disabled: busyAction === "initialize" || !walletAddress,
                            className: "mt-8 inline-flex items-center justify-center rounded-full bg-emerald-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60",
                            children: busyAction === "initialize" ? "Initializing..." : "Initialize Marketplace"
                        }, void 0, false, {
                            fileName: "[project]/components/MainFeature.tsx",
                            lineNumber: 452,
                            columnNumber: 11
                        }, this),
                        !walletAddress ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-4 text-sm text-amber-200",
                            children: "Connect the issuer wallet above to initialize the contract."
                        }, void 0, false, {
                            fileName: "[project]/components/MainFeature.tsx",
                            lineNumber: 462,
                            columnNumber: 13
                        }, this) : null
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/MainFeature.tsx",
                    lineNumber: 404,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rounded-[28px] border border-white/10 bg-white/6 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-semibold text-white",
                            children: "What initialization does"
                        }, void 0, false, {
                            fileName: "[project]/components/MainFeature.tsx",
                            lineNumber: 469,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                            className: "mt-5 space-y-4 text-sm leading-7 text-slate-300",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "Stores the issuer address as the marketplace admin."
                                }, void 0, false, {
                                    fileName: "[project]/components/MainFeature.tsx",
                                    lineNumber: 471,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "Sets the token name, symbol, and initial credit price in stroops."
                                }, void 0, false, {
                                    fileName: "[project]/components/MainFeature.tsx",
                                    lineNumber: 472,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "Mints the opening inventory that companies can buy from immediately."
                                }, void 0, false, {
                                    fileName: "[project]/components/MainFeature.tsx",
                                    lineNumber: 473,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    children: "Starts the retirement certificate counter at zero for future retirements."
                                }, void 0, false, {
                                    fileName: "[project]/components/MainFeature.tsx",
                                    lineNumber: 474,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/MainFeature.tsx",
                            lineNumber: 470,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/MainFeature.tsx",
                    lineNumber: 468,
                    columnNumber: 9
                }, this),
                actionMessage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100",
                    children: actionMessage
                }, void 0, false, {
                    fileName: "[project]/components/MainFeature.tsx",
                    lineNumber: 479,
                    columnNumber: 11
                }, this) : null,
                error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/components/MainFeature.tsx",
                    lineNumber: 485,
                    columnNumber: 11
                }, this) : null
            ]
        }, void 0, true, {
            fileName: "[project]/components/MainFeature.tsx",
            lineNumber: 403,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
                children: [
                    {
                        label: "Available credits",
                        value: formatCredits(dashboard.availableSupply)
                    },
                    {
                        label: "Market price",
                        value: formatXlm(unitPrice)
                    },
                    {
                        label: "Outstanding supply",
                        value: formatCredits(dashboard.totalSupply)
                    },
                    {
                        label: "Retired on-chain",
                        value: formatCredits(dashboard.totalRetired)
                    }
                ].map((card)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-[24px] border border-white/10 bg-white/6 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs uppercase tracking-[0.28em] text-slate-400",
                                children: card.label
                            }, void 0, false, {
                                fileName: "[project]/components/MainFeature.tsx",
                                lineNumber: 518,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-4 text-2xl font-semibold text-white",
                                children: card.value
                            }, void 0, false, {
                                fileName: "[project]/components/MainFeature.tsx",
                                lineNumber: 519,
                                columnNumber: 13
                            }, this)
                        ]
                    }, card.label, true, {
                        fileName: "[project]/components/MainFeature.tsx",
                        lineNumber: 514,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/MainFeature.tsx",
                lineNumber: 495,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-6 xl:grid-cols-[1.15fr_0.85fr]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),rgba(15,23,42,0.94)_50%)] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs uppercase tracking-[0.35em] text-sky-300/80",
                                                        children: "Marketplace"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 529,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        className: "mt-3 text-3xl font-semibold text-white",
                                                        children: dashboard.metadata?.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 530,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-2 text-sm leading-7 text-slate-300",
                                                        children: "Buy and retire on-chain carbon credits backed by Soroban contract state. Each token represents one tonne of CO₂ offset."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 533,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainFeature.tsx",
                                                lineNumber: 528,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-3xl border border-white/10 bg-slate-950/40 px-5 py-4 text-sm text-slate-200",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        children: [
                                                            "Symbol: ",
                                                            dashboard.metadata?.symbol
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 539,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-2 break-all text-slate-400",
                                                        children: [
                                                            "Issuer: ",
                                                            dashboard.admin
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 540,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainFeature.tsx",
                                                lineNumber: 538,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainFeature.tsx",
                                        lineNumber: 527,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-8 grid gap-4 lg:grid-cols-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-[24px] border border-white/10 bg-slate-950/40 p-5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-medium text-white",
                                                        children: "Buy credits"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 546,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-2 text-sm text-slate-400",
                                                        children: "Claim credits from the issuer inventory at the current Testnet quote."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 547,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "mt-5 block space-y-2 text-sm text-slate-200",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "Amount (credits)"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainFeature.tsx",
                                                                lineNumber: 551,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                value: buyAmount,
                                                                onChange: (event)=>setBuyAmount(event.target.value),
                                                                className: "w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-emerald-300/50"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainFeature.tsx",
                                                                lineNumber: 552,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 550,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-3 text-sm text-emerald-200",
                                                        children: [
                                                            "Quote: ",
                                                            formatXlm(quotedBuyCost)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 558,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: handleBuy,
                                                        disabled: busyAction === "buy" || !walletAddress,
                                                        className: "mt-5 inline-flex w-full items-center justify-center rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60",
                                                        children: busyAction === "buy" ? "Buying..." : "Buy Credits"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 561,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainFeature.tsx",
                                                lineNumber: 545,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-[24px] border border-white/10 bg-slate-950/40 p-5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-medium text-white",
                                                        children: "Retire credits"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 572,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-2 text-sm text-slate-400",
                                                        children: "Burn credits permanently and mint a verifiable retirement certificate on-chain."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 573,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-5 space-y-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                value: retireAmount,
                                                                onChange: (event)=>setRetireAmount(event.target.value),
                                                                placeholder: "Amount (credits)",
                                                                className: "w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/50"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainFeature.tsx",
                                                                lineNumber: 577,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                value: beneficiary,
                                                                onChange: (event)=>setBeneficiary(event.target.value),
                                                                placeholder: "Beneficiary company name",
                                                                className: "w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/50"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainFeature.tsx",
                                                                lineNumber: 583,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                                value: retirementNote,
                                                                onChange: (event)=>setRetirementNote(event.target.value),
                                                                rows: 3,
                                                                placeholder: "Retirement note",
                                                                className: "w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/50"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainFeature.tsx",
                                                                lineNumber: 589,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 576,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: handleRetire,
                                                        disabled: busyAction === "retire" || !walletAddress,
                                                        className: "mt-5 inline-flex w-full items-center justify-center rounded-full border border-sky-300/40 bg-sky-300/10 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-300/20 disabled:cursor-not-allowed disabled:opacity-60",
                                                        children: busyAction === "retire" ? "Retiring..." : "Retire Credits"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 597,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainFeature.tsx",
                                                lineNumber: 571,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainFeature.tsx",
                                        lineNumber: 544,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainFeature.tsx",
                                lineNumber: 526,
                                columnNumber: 11
                            }, this),
                            isAdmin ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-[28px] border border-white/10 bg-white/6 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs uppercase tracking-[0.35em] text-amber-300/80",
                                        children: "Issuer Console"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainFeature.tsx",
                                        lineNumber: 611,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "mt-3 text-2xl font-semibold text-white",
                                        children: "Admin controls"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainFeature.tsx",
                                        lineNumber: 612,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-6 grid gap-4 lg:grid-cols-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-[24px] border border-white/10 bg-slate-950/40 p-5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-medium text-white",
                                                        children: "Mint inventory"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 615,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        value: mintAmount,
                                                        onChange: (event)=>setMintAmount(event.target.value),
                                                        className: "mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-amber-300/50"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 616,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: handleMint,
                                                        disabled: busyAction === "mint",
                                                        className: "mt-4 inline-flex w-full items-center justify-center rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60",
                                                        children: busyAction === "mint" ? "Minting..." : "Mint Credits"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 621,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainFeature.tsx",
                                                lineNumber: 614,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-[24px] border border-white/10 bg-slate-950/40 p-5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-medium text-white",
                                                        children: "Update price"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 631,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        value: priceInput,
                                                        onChange: (event)=>setPriceInput(event.target.value),
                                                        className: "mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-amber-300/50"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 632,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: handleSetPrice,
                                                        disabled: busyAction === "price",
                                                        className: "mt-4 inline-flex w-full items-center justify-center rounded-full border border-amber-300/40 bg-amber-300/10 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-60",
                                                        children: busyAction === "price" ? "Updating..." : "Set Price"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 637,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainFeature.tsx",
                                                lineNumber: 630,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainFeature.tsx",
                                        lineNumber: 613,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainFeature.tsx",
                                lineNumber: 610,
                                columnNumber: 13
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MainFeature.tsx",
                        lineNumber: 525,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-[28px] border border-white/10 bg-white/6 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs uppercase tracking-[0.35em] text-emerald-300/80",
                                                        children: "Account Snapshot"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 655,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "mt-3 text-2xl font-semibold text-white",
                                                        children: "Your position"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 658,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainFeature.tsx",
                                                lineNumber: 654,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: rerenderDashboard,
                                                className: "rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-slate-300 transition hover:border-emerald-300/40 hover:text-white",
                                                children: isRefreshing ? "Refreshing..." : "Refresh"
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainFeature.tsx",
                                                lineNumber: 660,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainFeature.tsx",
                                        lineNumber: 653,
                                        columnNumber: 13
                                    }, this),
                                    walletAddress ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-6 space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-[22px] border border-white/10 bg-slate-950/40 p-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs uppercase tracking-[0.22em] text-slate-500",
                                                        children: "Wallet balance"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 672,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-2 text-xl font-semibold text-white",
                                                        children: formatCredits(dashboard.balance)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 673,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainFeature.tsx",
                                                lineNumber: 671,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid gap-4 sm:grid-cols-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "rounded-[22px] border border-white/10 bg-slate-950/40 p-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs uppercase tracking-[0.22em] text-slate-500",
                                                                children: "Lifetime purchased"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainFeature.tsx",
                                                                lineNumber: 679,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "mt-2 text-lg font-semibold text-white",
                                                                children: formatCredits(dashboard.lifetimePurchased)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainFeature.tsx",
                                                                lineNumber: 682,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 678,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "rounded-[22px] border border-white/10 bg-slate-950/40 p-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs uppercase tracking-[0.22em] text-slate-500",
                                                                children: "Lifetime retired"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainFeature.tsx",
                                                                lineNumber: 687,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "mt-2 text-lg font-semibold text-white",
                                                                children: formatCredits(dashboard.lifetimeRetired)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainFeature.tsx",
                                                                lineNumber: 690,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 686,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainFeature.tsx",
                                                lineNumber: 677,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/MainFeature.tsx",
                                        lineNumber: 670,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-6 text-sm leading-7 text-slate-300",
                                        children: "Connect Freighter to view your balance, lifetime purchase history, and retirement certificate."
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainFeature.tsx",
                                        lineNumber: 697,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainFeature.tsx",
                                lineNumber: 652,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.16),rgba(15,23,42,0.94)_55%)] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs uppercase tracking-[0.35em] text-emerald-300/80",
                                        children: "Retirement Certificate"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainFeature.tsx",
                                        lineNumber: 705,
                                        columnNumber: 13
                                    }, this),
                                    dashboard.latestCertificate ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "mt-3 text-2xl font-semibold text-white",
                                                children: [
                                                    "Certificate #",
                                                    dashboard.latestCertificate.id.toString()
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainFeature.tsx",
                                                lineNumber: 710,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-6 space-y-4 text-sm text-slate-200",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-slate-400",
                                                                children: "Retiree:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainFeature.tsx",
                                                                lineNumber: 715,
                                                                columnNumber: 21
                                                            }, this),
                                                            " ",
                                                            dashboard.latestCertificate.retiree
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 714,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-slate-400",
                                                                children: "Beneficiary:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainFeature.tsx",
                                                                lineNumber: 719,
                                                                columnNumber: 21
                                                            }, this),
                                                            " ",
                                                            dashboard.latestCertificate.beneficiary
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 718,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-slate-400",
                                                                children: "Amount:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainFeature.tsx",
                                                                lineNumber: 723,
                                                                columnNumber: 21
                                                            }, this),
                                                            " ",
                                                            formatCredits(dashboard.latestCertificate.amount)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 722,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-slate-400",
                                                                children: "Retired at:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainFeature.tsx",
                                                                lineNumber: 727,
                                                                columnNumber: 21
                                                            }, this),
                                                            " ",
                                                            formatTimestamp(dashboard.latestCertificate.retiredAt)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 726,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-slate-400",
                                                                children: "Note:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/MainFeature.tsx",
                                                                lineNumber: 731,
                                                                columnNumber: 21
                                                            }, this),
                                                            " ",
                                                            dashboard.latestCertificate.note
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/MainFeature.tsx",
                                                        lineNumber: 730,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/MainFeature.tsx",
                                                lineNumber: 713,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-4 text-sm leading-7 text-slate-300",
                                        children: "No retirement certificate found for this wallet yet. Retire credits to mint an on-chain certificate and event log."
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainFeature.tsx",
                                        lineNumber: 737,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MainFeature.tsx",
                                lineNumber: 704,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MainFeature.tsx",
                        lineNumber: 651,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MainFeature.tsx",
                lineNumber: 524,
                columnNumber: 7
            }, this),
            actionMessage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100",
                children: actionMessage
            }, void 0, false, {
                fileName: "[project]/components/MainFeature.tsx",
                lineNumber: 747,
                columnNumber: 9
            }, this) : null,
            error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/MainFeature.tsx",
                lineNumber: 753,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/components/MainFeature.tsx",
        lineNumber: 494,
        columnNumber: 5
    }, this);
}
_s(MainFeature, "mEQ+SDMkvOCHE9ZYNaf4RevGZsw=");
_c = MainFeature;
var _c;
__turbopack_context__.k.register(_c, "MainFeature");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/WalletConnect.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WalletConnect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stellar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/stellar.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function truncateAddress(address) {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
function WalletConnect({ walletAddress, onConnected, onDisconnected }) {
    _s();
    const [isConnecting, setIsConnecting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isFunding, setIsFunding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [friendbotMessage, setFriendbotMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const label = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WalletConnect.useMemo[label]": ()=>{
            if (!walletAddress) {
                return "Connect Wallet";
            }
            return truncateAddress(walletAddress);
        }
    }["WalletConnect.useMemo[label]"], [
        walletAddress
    ]);
    const handleConnect = async ()=>{
        setError(null);
        setFriendbotMessage(null);
        setIsConnecting(true);
        try {
            const publicKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stellar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFreighterPublicKey"])();
            onConnected(publicKey);
        } catch (connectError) {
            setError(connectError instanceof Error ? connectError.message : "Failed to connect Freighter.");
        } finally{
            setIsConnecting(false);
        }
    };
    const handleFund = async ()=>{
        if (!walletAddress) {
            return;
        }
        setError(null);
        setFriendbotMessage(null);
        setIsFunding(true);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$stellar$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fundWithFriendbot"])(walletAddress);
            setFriendbotMessage("Friendbot funded your Testnet account.");
        } catch (fundingError) {
            setError(fundingError instanceof Error ? fundingError.message : "Friendbot funding failed.");
        } finally{
            setIsFunding(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs uppercase tracking-[0.35em] text-emerald-300/80",
                                children: "Wallet"
                            }, void 0, false, {
                                fileName: "[project]/components/WalletConnect.tsx",
                                lineNumber: 80,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "mt-2 text-xl font-semibold text-white",
                                children: walletAddress ? "Freighter connected" : "Connect Freighter on Testnet"
                            }, void 0, false, {
                                fileName: "[project]/components/WalletConnect.tsx",
                                lineNumber: 83,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-sm text-slate-300",
                                children: walletAddress ? `Connected account: ${label}` : "Use your Freighter wallet to sign Soroban marketplace transactions."
                            }, void 0, false, {
                                fileName: "[project]/components/WalletConnect.tsx",
                                lineNumber: 86,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/WalletConnect.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: walletAddress ? onDisconnected : handleConnect,
                                disabled: isConnecting,
                                className: "inline-flex min-w-40 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-400/10 px-5 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-200 hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60",
                                children: isConnecting ? "Connecting..." : walletAddress ? "Disconnect" : "Connect Wallet"
                            }, void 0, false, {
                                fileName: "[project]/components/WalletConnect.tsx",
                                lineNumber: 94,
                                columnNumber: 11
                            }, this),
                            walletAddress ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleFund,
                                disabled: isFunding,
                                className: "inline-flex min-w-40 items-center justify-center rounded-full border border-sky-300/30 bg-sky-400/10 px-5 py-3 text-sm font-medium text-sky-100 transition hover:border-sky-200 hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-60",
                                children: isFunding ? "Funding..." : "Get Testnet XLM"
                            }, void 0, false, {
                                fileName: "[project]/components/WalletConnect.tsx",
                                lineNumber: 104,
                                columnNumber: 13
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/WalletConnect.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/WalletConnect.tsx",
                lineNumber: 78,
                columnNumber: 7
            }, this),
            friendbotMessage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100",
                children: friendbotMessage
            }, void 0, false, {
                fileName: "[project]/components/WalletConnect.tsx",
                lineNumber: 117,
                columnNumber: 9
            }, this) : null,
            error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/WalletConnect.tsx",
                lineNumber: 123,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/components/WalletConnect.tsx",
        lineNumber: 77,
        columnNumber: 5
    }, this);
}
_s(WalletConnect, "ulSwS56gw5oQGRIGkIny0CCPA1U=");
_c = WalletConnect;
var _c;
__turbopack_context__.k.register(_c, "WalletConnect");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainFeature$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MainFeature.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WalletConnect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/WalletConnect.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function HomePage() {
    _s();
    const [walletAddress, setWalletAddress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#020617_0%,#081423_38%,#030712_100%)] text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_bottom,rgba(15,118,110,0.18),transparent_34%)]"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 12,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:48px_48px]"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "rounded-[32px] border border-white/10 bg-white/6 px-6 py-8 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs uppercase tracking-[0.4em] text-emerald-300/80",
                                children: "Stellar Testnet"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 17,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "max-w-3xl",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "text-4xl font-semibold tracking-tight text-white sm:text-5xl",
                                                children: "CarbonDEX"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 22,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-4 text-base leading-8 text-slate-300 sm:text-lg",
                                                children: "Issue, trade, and retire tokenized carbon credits on Soroban. Each credit equals one tonne of CO₂ offset, and every retirement is anchored on-chain with a certificate-grade event trail."
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 25,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 21,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-3xl border border-emerald-300/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-100",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "RPC: https://soroban-testnet.stellar.org"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 33,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-2",
                                                children: "Horizon: https://horizon-testnet.stellar.org"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 34,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 32,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 20,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 16,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WalletConnect$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        walletAddress: walletAddress,
                        onConnected: setWalletAddress,
                        onDisconnected: ()=>setWalletAddress(null)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainFeature$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        walletAddress: walletAddress
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_s(HomePage, "gink3R2wQZ2Qgh5fc9oQ+ykQXc4=");
_c = HomePage;
var _c;
__turbopack_context__.k.register(_c, "HomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_06n7qcx._.js.map