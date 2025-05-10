module rivals_tournament::user_reputation {
    // Import standard libraries
    use sui::table::{Self, Table};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::balance::{Self, Balance};
    
    use std::string::String;
    
    // Error codes
    const EInsufficientStake: u64 = 1;
    const ENotOwner: u64 = 3;
    
    // User profile struct
    public struct UserProfile has key {
        id: UID,
        owner: address,
        reputation_score: u64,
        tournaments_participated: u64,
        tournaments_won: u64,
        total_votes_cast: u64,
        staked_amount: u64,
        // We'll store the stake directly rather than in an Option to avoid drop ability issues
        stake: Balance<SUI>,
    }
    
    // User registry to keep track of all users
    public struct UserRegistry has key {
        id: UID,
        users: Table<address, ID>,
        admin: address,
    }
    
    // Events
    public struct UserProfileCreatedEvent has copy, drop {
        user_id: ID,
        owner: address,
    }
    
    public struct StakeAddedEvent has copy, drop {
        user_id: ID,
        owner: address,
        amount: u64,
        total_staked: u64,
    }
    
    public struct ReputationIncreasedEvent has copy, drop {
        user_id: ID,
        owner: address,
        new_score: u64,
        reason: String,
    }
    
    // Initialize the user registry
    fun init(ctx: &mut TxContext) {
        let registry = UserRegistry {
            id: object::new(ctx),
            users: table::new(ctx),
            admin: tx_context::sender(ctx),
        };
        
        transfer::share_object(registry);
    }
    
    #[test_only]
    /// Create a user registry for testing
    public fun create_registry_for_testing(ctx: &mut TxContext) {
        let registry = UserRegistry {
            id: object::new(ctx),
            users: table::new(ctx),
            admin: tx_context::sender(ctx),
        };
        
        transfer::share_object(registry);
    }
    
    // Create a new user profile
    public fun create_profile(
        registry: &mut UserRegistry,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Check if user already has a profile
        if (table::contains(&registry.users, sender)) {
            return
        };
        
        // Create new profile
        let profile = UserProfile {
            id: object::new(ctx),
            owner: sender,
            reputation_score: 100, // Start with base reputation
            tournaments_participated: 0,
            tournaments_won: 0,
            total_votes_cast: 0,
            staked_amount: 0,
            stake: balance::zero(),  // Start with zero balance
        };
        
        let profile_id = object::id(&profile);
        
        // Add to registry
        table::add(&mut registry.users, sender, profile_id);
        
        // Emit event
        event::emit(UserProfileCreatedEvent {
            user_id: profile_id,
            owner: sender,
        });
        
        // Transfer profile to user
        transfer::transfer(profile, sender);
    }
    
    // Add stake to increase voting power
    public fun add_stake(
        profile: &mut UserProfile,
        stake: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Verify caller is the owner
        assert!(tx_context::sender(ctx) == profile.owner, ENotOwner);
        
        let stake_amount = coin::value(&stake);
        
        // Add to the stake
        balance::join(&mut profile.stake, coin::into_balance(stake));
        
        // Update staked amount
        profile.staked_amount = profile.staked_amount + stake_amount;
        
        // Emit event
        event::emit(StakeAddedEvent {
            user_id: object::id(profile),
            owner: profile.owner,
            amount: stake_amount,
            total_staked: profile.staked_amount,
        });
    }
    
    // Withdraw stake
    public fun withdraw_stake(
        profile: &mut UserProfile,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<SUI> {
        // Verify caller is the owner
        assert!(tx_context::sender(ctx) == profile.owner, ENotOwner);
        
        // Verify sufficient stake
        assert!(profile.staked_amount >= amount, EInsufficientStake);
        assert!(balance::value(&profile.stake) >= amount, EInsufficientStake);
        
        // Withdraw stake
        let withdrawn_balance = balance::split(&mut profile.stake, amount);
        let withdrawn = coin::from_balance(withdrawn_balance, ctx);
        
        // Update staked amount
        profile.staked_amount = profile.staked_amount - amount;
        
        withdrawn
    }
    
    // Increase reputation after tournament participation
    public fun increase_reputation(
        profile: &mut UserProfile,
        amount: u64,
        reason: String,
        ctx: &mut TxContext
    ) {
        // Only owner or admin can increase reputation
        let sender = tx_context::sender(ctx);
        assert!(sender == profile.owner, ENotOwner);
        
        // Increase reputation
        profile.reputation_score = profile.reputation_score + amount;
        
        // Emit event
        event::emit(ReputationIncreasedEvent {
            user_id: object::id(profile),
            owner: profile.owner,
            new_score: profile.reputation_score,
            reason,
        });
    }
    
    // Record tournament participation
    public fun record_tournament_participation(
        profile: &mut UserProfile,
        won: bool,
        votes_cast: u64,
        ctx: &mut TxContext
    ) {
        // Verify caller is the owner
        assert!(tx_context::sender(ctx) == profile.owner, ENotOwner);
        
        // Update stats
        profile.tournaments_participated = profile.tournaments_participated + 1;
        profile.total_votes_cast = profile.total_votes_cast + votes_cast;
        
        if (won) {
            profile.tournaments_won = profile.tournaments_won + 1;
            
            // Bonus reputation for winning
            increase_reputation(
                profile,
                50,
                std::string::utf8(b"Tournament win"),
                ctx
            );
        } else {
            // Small reputation for participation
            increase_reputation(
                profile,
                10,
                std::string::utf8(b"Tournament participation"),
                ctx
            );
        };
    }
    
    // Get user profile details
    public fun get_profile_details(profile: &UserProfile): (address, u64, u64, u64, u64, u64) {
        (
            profile.owner,
            profile.reputation_score,
            profile.tournaments_participated,
            profile.tournaments_won,
            profile.total_votes_cast,
            profile.staked_amount
        )
    }
    
    // Calculate voting power based on reputation and stake
    public fun calculate_voting_power(profile: &UserProfile): u64 {
        // Base voting power from reputation
        let base_power = profile.reputation_score / 10;
        
        // Bonus from staking
        let stake_bonus = profile.staked_amount / 100000000; // 1 SUI = 100000000 units
        
        // Total voting power
        base_power + stake_bonus
    }
}
