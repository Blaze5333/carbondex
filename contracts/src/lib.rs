#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, panic_with_error, symbol_short, Address,
    Env, String,
};

const INSTANCE_LIFETIME_THRESHOLD: u32 = 1_000;
const INSTANCE_LIFETIME_BUMP: u32 = 10_000;
const PERSISTENT_LIFETIME_THRESHOLD: u32 = 1_000;
const PERSISTENT_LIFETIME_BUMP: u32 = 10_000;
const DECIMALS: u32 = 0;

#[contract]
pub struct CarbonDex;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum CarbonDexError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
    InvalidPrice = 5,
    InsufficientInventory = 6,
    InsufficientBalance = 7,
    MissingCertificate = 8,
    ArithmeticOverflow = 9,
    EmptyBeneficiary = 10,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    Name,
    Symbol,
    PriceStroops,
    TotalSupply,
    AvailableSupply,
    TotalRetired,
    RetirementCounter,
    Balance(Address),
    LifetimePurchased(Address),
    LifetimeRetired(Address),
    LatestCertificate(Address),
    Certificate(u64),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub decimals: u32,
    pub price_stroops: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RetirementCertificate {
    pub id: u64,
    pub retiree: Address,
    pub beneficiary: String,
    pub amount: i128,
    pub note: String,
    pub retired_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MarketplaceInitializedEvent {
    pub admin: Address,
    pub initial_supply: i128,
    pub price_stroops: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CreditsMintedEvent {
    pub issuer: Address,
    pub amount: i128,
    pub total_supply: i128,
    pub available_supply: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PriceUpdatedEvent {
    pub admin: Address,
    pub new_price_stroops: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CreditsPurchasedEvent {
    pub buyer: Address,
    pub amount: i128,
    pub total_cost_stroops: i128,
    pub remaining_supply: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CreditsRetiredEvent {
    pub retiree: Address,
    pub certificate_id: u64,
    pub beneficiary: String,
    pub amount: i128,
    pub retired_at: u64,
}

fn bump_instance(env: &Env) {
    // Keep contract instance storage alive so metadata and config remain readable.
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_LIFETIME_BUMP);
}

fn bump_persistent(env: &Env, key: &DataKey) {
    // Keep user balances and certificates alive after contract interaction.
    env.storage()
        .persistent()
        .extend_ttl(key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_LIFETIME_BUMP);
}

fn read_instance_i128(env: &Env, key: &DataKey) -> Result<i128, CarbonDexError> {
    // Read a required integer from instance storage and fail clearly if init never happened.
    env.storage()
        .instance()
        .get(key)
        .ok_or(CarbonDexError::NotInitialized)
}

fn read_persistent_i128(env: &Env, key: &DataKey) -> i128 {
    // Missing per-address values default to zero balances or counters.
    env.storage().persistent().get(key).unwrap_or(0)
}

fn write_persistent_i128(env: &Env, key: &DataKey, value: i128) {
    // Persist the updated per-address value and renew its TTL.
    env.storage().persistent().set(key, &value);
    bump_persistent(env, key);
}

fn checked_add(lhs: i128, rhs: i128, env: &Env) -> i128 {
    // Soroban panics are opaque, so emit a contract error on arithmetic overflow instead.
    lhs.checked_add(rhs)
        .unwrap_or_else(|| panic_with_error!(env, CarbonDexError::ArithmeticOverflow))
}

fn checked_sub(lhs: i128, rhs: i128, env: &Env) -> i128 {
    // Credits should never underflow when inventory or balances are decremented.
    lhs.checked_sub(rhs)
        .unwrap_or_else(|| panic_with_error!(env, CarbonDexError::ArithmeticOverflow))
}

fn checked_mul(lhs: i128, rhs: i128, env: &Env) -> i128 {
    // Purchase pricing is quoted in stroops, so multiplication must be overflow-safe.
    lhs.checked_mul(rhs)
        .unwrap_or_else(|| panic_with_error!(env, CarbonDexError::ArithmeticOverflow))
}

fn require_initialized(env: &Env) {
    // Every public function except initialize relies on the admin key existing.
    if !env.storage().instance().has(&DataKey::Admin) {
        panic_with_error!(env, CarbonDexError::NotInitialized);
    }

    bump_instance(env);
}

fn require_positive_amount(env: &Env, amount: i128) {
    // Carbon credits are whole-tonne units, so amount must be strictly positive.
    if amount <= 0 {
        panic_with_error!(env, CarbonDexError::InvalidAmount);
    }
}

fn require_admin(env: &Env, admin: &Address) {
    // Protect issuer-only actions by checking auth and matching the configured admin.
    admin.require_auth();

    let stored_admin: Address = env
        .storage()
        .instance()
        .get(&DataKey::Admin)
        .unwrap_or_else(|| panic_with_error!(env, CarbonDexError::NotInitialized));

    if stored_admin != *admin {
        panic_with_error!(env, CarbonDexError::Unauthorized);
    }
}

#[contractimpl]
impl CarbonDex {
    pub fn initialize(
        env: Env,
        admin: Address,
        name: String,
        symbol: String,
        price_stroops: i128,
        initial_supply: i128,
    ) {
        // Initialization should only ever succeed once for a deployed contract instance.
        if env.storage().instance().has(&DataKey::Admin) {
            panic_with_error!(&env, CarbonDexError::AlreadyInitialized);
        }

        // The issuer must authorize the initialization transaction.
        admin.require_auth();

        // Price and initial supply define the opening inventory for the marketplace.
        if price_stroops <= 0 {
            panic_with_error!(&env, CarbonDexError::InvalidPrice);
        }
        require_positive_amount(&env, initial_supply);

        // Store immutable metadata and mutable marketplace state in instance storage.
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage()
            .instance()
            .set(&DataKey::PriceStroops, &price_stroops);
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &initial_supply);
        env.storage()
            .instance()
            .set(&DataKey::AvailableSupply, &initial_supply);
        env.storage().instance().set(&DataKey::TotalRetired, &0_i128);
        env.storage().instance().set(&DataKey::RetirementCounter, &0_u64);
        bump_instance(&env);

        // Emit the initial inventory snapshot so indexers can pick up deployment state.
        env.events().publish(
            (symbol_short!("init"), admin.clone()),
            MarketplaceInitializedEvent {
                admin,
                initial_supply,
                price_stroops,
            },
        );
    }

    pub fn admin(env: Env) -> Address {
        // Return the configured issuer address for frontend display and admin checks.
        require_initialized(&env);
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, CarbonDexError::NotInitialized))
    }

    pub fn metadata(env: Env) -> TokenMetadata {
        // Package token metadata and marketplace pricing into a single read.
        require_initialized(&env);

        TokenMetadata {
            name: env
                .storage()
                .instance()
                .get(&DataKey::Name)
                .unwrap_or_else(|| panic_with_error!(&env, CarbonDexError::NotInitialized)),
            symbol: env
                .storage()
                .instance()
                .get(&DataKey::Symbol)
                .unwrap_or_else(|| panic_with_error!(&env, CarbonDexError::NotInitialized)),
            decimals: DECIMALS,
            price_stroops: read_instance_i128(&env, &DataKey::PriceStroops)
                .unwrap_or_else(|_| panic_with_error!(&env, CarbonDexError::NotInitialized)),
        }
    }

    pub fn price_stroops(env: Env) -> i128 {
        // Expose the current marketplace price per credit in stroops.
        require_initialized(&env);
        read_instance_i128(&env, &DataKey::PriceStroops)
            .unwrap_or_else(|_| panic_with_error!(&env, CarbonDexError::NotInitialized))
    }

    pub fn set_price(env: Env, admin: Address, new_price_stroops: i128) {
        // Only the issuer can change pricing for newly purchased inventory.
        require_initialized(&env);
        require_admin(&env, &admin);

        if new_price_stroops <= 0 {
            panic_with_error!(&env, CarbonDexError::InvalidPrice);
        }

        env.storage()
            .instance()
            .set(&DataKey::PriceStroops, &new_price_stroops);
        bump_instance(&env);

        // Emit the new price so frontends and indexers can update immediately.
        env.events().publish(
            (symbol_short!("price"), admin.clone()),
            PriceUpdatedEvent {
                admin,
                new_price_stroops,
            },
        );
    }

    pub fn mint(env: Env, admin: Address, amount: i128) {
        // Minting increases total supply and immediately makes credits available for purchase.
        require_initialized(&env);
        require_admin(&env, &admin);
        require_positive_amount(&env, amount);

        let current_total = read_instance_i128(&env, &DataKey::TotalSupply)
            .unwrap_or_else(|_| panic_with_error!(&env, CarbonDexError::NotInitialized));
        let current_available = read_instance_i128(&env, &DataKey::AvailableSupply)
            .unwrap_or_else(|_| panic_with_error!(&env, CarbonDexError::NotInitialized));

        let new_total = checked_add(current_total, amount, &env);
        let new_available = checked_add(current_available, amount, &env);

        env.storage().instance().set(&DataKey::TotalSupply, &new_total);
        env.storage()
            .instance()
            .set(&DataKey::AvailableSupply, &new_available);
        bump_instance(&env);

        // Emit a mint event so inventory top-ups are visible on-chain.
        env.events().publish(
            (symbol_short!("mint"), admin.clone()),
            CreditsMintedEvent {
                issuer: admin,
                amount,
                total_supply: new_total,
                available_supply: new_available,
            },
        );
    }

    pub fn buy(env: Env, buyer: Address, amount: i128) -> i128 {
        // Buyers authorize purchases themselves so the source account signature is explicit.
        require_initialized(&env);
        buyer.require_auth();
        require_positive_amount(&env, amount);

        let available = read_instance_i128(&env, &DataKey::AvailableSupply)
            .unwrap_or_else(|_| panic_with_error!(&env, CarbonDexError::NotInitialized));
        if amount > available {
            panic_with_error!(&env, CarbonDexError::InsufficientInventory);
        }

        let unit_price = read_instance_i128(&env, &DataKey::PriceStroops)
            .unwrap_or_else(|_| panic_with_error!(&env, CarbonDexError::NotInitialized));
        let total_cost = checked_mul(unit_price, amount, &env);
        let new_available = checked_sub(available, amount, &env);

        let balance_key = DataKey::Balance(buyer.clone());
        let current_balance = read_persistent_i128(&env, &balance_key);
        let new_balance = checked_add(current_balance, amount, &env);
        write_persistent_i128(&env, &balance_key, new_balance);

        let lifetime_key = DataKey::LifetimePurchased(buyer.clone());
        let lifetime_purchased = read_persistent_i128(&env, &lifetime_key);
        write_persistent_i128(
            &env,
            &lifetime_key,
            checked_add(lifetime_purchased, amount, &env),
        );

        env.storage()
            .instance()
            .set(&DataKey::AvailableSupply, &new_available);
        bump_instance(&env);

        // Emit a purchase event with the quoted stroop total for off-chain settlement tracking.
        env.events().publish(
            (symbol_short!("buy"), buyer.clone()),
            CreditsPurchasedEvent {
                buyer,
                amount,
                total_cost_stroops: total_cost,
                remaining_supply: new_available,
            },
        );

        total_cost
    }

    pub fn retire(
        env: Env,
        holder: Address,
        amount: i128,
        beneficiary: String,
        note: String,
    ) -> u64 {
        // The holder must approve retirement because it permanently burns their credits.
        require_initialized(&env);
        holder.require_auth();
        require_positive_amount(&env, amount);

        if beneficiary.len() == 0 {
            panic_with_error!(&env, CarbonDexError::EmptyBeneficiary);
        }

        let balance_key = DataKey::Balance(holder.clone());
        let current_balance = read_persistent_i128(&env, &balance_key);
        if amount > current_balance {
            panic_with_error!(&env, CarbonDexError::InsufficientBalance);
        }

        let new_balance = checked_sub(current_balance, amount, &env);
        write_persistent_i128(&env, &balance_key, new_balance);

        let lifetime_retired_key = DataKey::LifetimeRetired(holder.clone());
        let current_lifetime_retired = read_persistent_i128(&env, &lifetime_retired_key);
        write_persistent_i128(
            &env,
            &lifetime_retired_key,
            checked_add(current_lifetime_retired, amount, &env),
        );

        let total_supply = read_instance_i128(&env, &DataKey::TotalSupply)
            .unwrap_or_else(|_| panic_with_error!(&env, CarbonDexError::NotInitialized));
        let total_retired = read_instance_i128(&env, &DataKey::TotalRetired)
            .unwrap_or_else(|_| panic_with_error!(&env, CarbonDexError::NotInitialized));
        let retirement_counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::RetirementCounter)
            .unwrap_or_else(|| panic_with_error!(&env, CarbonDexError::NotInitialized));

        let certificate_id = retirement_counter.saturating_add(1);
        let new_total_supply = checked_sub(total_supply, amount, &env);
        let new_total_retired = checked_add(total_retired, amount, &env);
        let retired_at = env.ledger().timestamp();

        let certificate = RetirementCertificate {
            id: certificate_id,
            retiree: holder.clone(),
            beneficiary: beneficiary.clone(),
            amount,
            note,
            retired_at,
        };

        let certificate_key = DataKey::Certificate(certificate_id);
        env.storage().persistent().set(&certificate_key, &certificate);
        bump_persistent(&env, &certificate_key);

        let latest_key = DataKey::LatestCertificate(holder.clone());
        env.storage().persistent().set(&latest_key, &certificate_id);
        bump_persistent(&env, &latest_key);

        env.storage()
            .instance()
            .set(&DataKey::RetirementCounter, &certificate_id);
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &new_total_supply);
        env.storage()
            .instance()
            .set(&DataKey::TotalRetired, &new_total_retired);
        bump_instance(&env);

        // Emit the retirement certificate details so off-chain consumers can index them from events.
        env.events().publish(
            (symbol_short!("retire"), holder.clone(), certificate_id),
            CreditsRetiredEvent {
                retiree: holder,
                certificate_id,
                beneficiary,
                amount,
                retired_at,
            },
        );

        certificate_id
    }

    pub fn balance(env: Env, owner: Address) -> i128 {
        // Return the current spendable carbon credit balance for a given account.
        require_initialized(&env);
        let key = DataKey::Balance(owner);
        let value = read_persistent_i128(&env, &key);
        if env.storage().persistent().has(&key) {
            bump_persistent(&env, &key);
        }
        value
    }

    pub fn available_supply(env: Env) -> i128 {
        // Inventory available for new purchases lives separately from user balances.
        require_initialized(&env);
        read_instance_i128(&env, &DataKey::AvailableSupply)
            .unwrap_or_else(|_| panic_with_error!(&env, CarbonDexError::NotInitialized))
    }

    pub fn total_supply(env: Env) -> i128 {
        // Total supply decreases when credits are retired because retirement burns them.
        require_initialized(&env);
        read_instance_i128(&env, &DataKey::TotalSupply)
            .unwrap_or_else(|_| panic_with_error!(&env, CarbonDexError::NotInitialized))
    }

    pub fn total_retired(env: Env) -> i128 {
        // This cumulative metric tracks how many tonnes have been retired historically.
        require_initialized(&env);
        read_instance_i128(&env, &DataKey::TotalRetired)
            .unwrap_or_else(|_| panic_with_error!(&env, CarbonDexError::NotInitialized))
    }

    pub fn lifetime_purchased(env: Env, buyer: Address) -> i128 {
        // Lifetime purchase totals are useful for dashboard summaries and issuer analytics.
        require_initialized(&env);
        let key = DataKey::LifetimePurchased(buyer);
        let value = read_persistent_i128(&env, &key);
        if env.storage().persistent().has(&key) {
            bump_persistent(&env, &key);
        }
        value
    }

    pub fn lifetime_retired(env: Env, holder: Address) -> i128 {
        // Lifetime retired totals help companies report their cumulative offset usage.
        require_initialized(&env);
        let key = DataKey::LifetimeRetired(holder);
        let value = read_persistent_i128(&env, &key);
        if env.storage().persistent().has(&key) {
            bump_persistent(&env, &key);
        }
        value
    }

    pub fn latest_certificate_id(env: Env, holder: Address) -> u64 {
        // Returning zero when no retirement exists keeps the frontend logic straightforward.
        require_initialized(&env);
        let key = DataKey::LatestCertificate(holder);
        let value = env.storage().persistent().get(&key).unwrap_or(0_u64);
        if env.storage().persistent().has(&key) {
            bump_persistent(&env, &key);
        }
        value
    }

    pub fn get_certificate(env: Env, certificate_id: u64) -> RetirementCertificate {
        // Certificates are stored permanently so anyone can verify an offset retirement later.
        require_initialized(&env);
        let key = DataKey::Certificate(certificate_id);
        let certificate = env.storage().persistent().get(&key).unwrap_or_else(|| {
            panic_with_error!(&env, CarbonDexError::MissingCertificate)
        });
        bump_persistent(&env, &key);
        certificate
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    fn setup() -> (Env, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let buyer = Address::generate(&env);

        (env, admin, buyer)
    }

    #[test]
    fn initialize_and_buy_updates_inventory_and_balance() {
        let (env, _admin, buyer) = setup();
        let contract_id = env.register_contract(None, CarbonDex);
        let client = CarbonDexClient::new(&env, &contract_id);

        client.initialize(
            &_admin,
            &String::from_str(&env, "CarbonDEX Credit"),
            &String::from_str(&env, "CO2"),
            &1_250_000_i128,
            &1_000_i128,
        );

        let quoted_cost = client.buy(&buyer, &25_i128);

        assert_eq!(quoted_cost, 31_250_000_i128);
        assert_eq!(client.available_supply(), 975_i128);
        assert_eq!(client.balance(&buyer), 25_i128);
        assert_eq!(client.lifetime_purchased(&buyer), 25_i128);
    }

    #[test]
    fn retire_creates_certificate_and_burns_supply() {
        let (env, admin, buyer) = setup();
        let contract_id = env.register_contract(None, CarbonDex);
        let client = CarbonDexClient::new(&env, &contract_id);

        client.initialize(
            &admin,
            &String::from_str(&env, "CarbonDEX Credit"),
            &String::from_str(&env, "CO2"),
            &1_250_000_i128,
            &1_000_i128,
        );

        client.buy(&buyer, &40_i128);
        let certificate_id = client.retire(
            &buyer,
            &15_i128,
            &String::from_str(&env, "Acme Manufacturing"),
            &String::from_str(&env, "Scope 2 emissions for Q1"),
        );

        let certificate = client.get_certificate(&certificate_id);

        assert_eq!(certificate_id, 1_u64);
        assert_eq!(certificate.amount, 15_i128);
        assert_eq!(certificate.beneficiary, String::from_str(&env, "Acme Manufacturing"));
        assert_eq!(client.balance(&buyer), 25_i128);
        assert_eq!(client.total_supply(), 985_i128);
        assert_eq!(client.total_retired(), 15_i128);
        assert_eq!(client.latest_certificate_id(&buyer), 1_u64);
        assert_eq!(client.lifetime_retired(&buyer), 15_i128);
    }
}
