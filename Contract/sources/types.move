module rival_contract::types {
    use sui::object::{UID};
    use sui::tx_context::TxContext;
    use std::string::{Self, String};
    use sui::url::Url;
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use std::option::{Self, Option};
    use std::vector;
    use sui::object;
    use sui::coin::{Self, Coin};
    use sui::transfer;
    
    // Tournament types
    const TOURNAMENT_DAILY: u8 = 0;
    const TOURNAMENT_WEEKLY: u8 = 1;
    const TOURNAMENT_MONTHLY: u8 = 2;
    
    // Tournament status
    const STATUS_UPCOMING: u8 = 0;
    const STATUS_ACTIVE: u8 = 1;
    const STATUS_COMPLETED: u8 = 2;
    
    // Vote types
    const VOTE_PASS: u8 = 0; // Swipe left
    const VOTE_SMASH: u8 = 1; // Swipe right
    
    // Point values
    const POINTS_DAILY: u64 = 1;
    const POINTS_WEEKLY: u64 = 3;
    const POINTS_MONTHLY: u64 = 5;
    
    // Fee and reward percentages
    const WINNER_REWARD_PERCENTAGE: u64 = 70;
    const PLATFORM_FEE_PERCENTAGE: u64 = 30;
    
    // Minimum entry fee (1 SUI)
    const MIN_ENTRY_FEE: u64 = 1_000_000_000; // 1 SUI in MIST
    
    // Error codes
    const EInsufficientFee: u64 = 0;
    const EInvalidTournament: u64 = 1;
    const ETournamentNotActive: u64 = 2;
    const ETournamentFull: u64 = 3;
    const ENotOwner: u64 = 4;
    const EInvalidVote: u64 = 5;
    const ECooldownActive: u64 = 6;
    const EInsufficientPoints: u64 = 7;
    
    // Admin capability for privileged operations
    public struct AdminCap has key, store {
        id: UID
    }
    
    // Registered NFT in the platform
    public struct RegisteredNFT has key, store {
        id: UID,
        original_id: address,  // Original NFT ID
        owner: address,
        name: String,
        description: String,
        image_url: Url,
        registered_at: u64,   // Timestamp
        score: u64,           // Accumulated score/points
        tournament_wins: u64,
        total_votes: u64,
        total_smashes: u64    // Total right swipes
    }
    
    // Tournament structure
    public struct Tournament has key, store {
        id: UID,
        name: String,
        description: String,
        start_time: u64,
        end_time: u64,
        status: u8,           // 0: Upcoming, 1: Active, 2: Completed
        prize_pool: Balance<SUI>,
        entry_fee: u64,       // In MIST
        max_participants: u64,
        current_participants: u64,
        tournament_type: u8,  // 0: Daily, 1: Weekly, 2: Monthly
        participants: vector<address>, // IDs of participating NFTs
        winner: Option<address>  // Winner NFT ID
    }
    
    // Vote record
    public struct Vote has key, store {
        id: UID,
        voter: address,
        tournament_id: address,
        nft_id: address,        // NFT ID that was voted on
        vote_type: u8,          // 0: Pass (left), 1: Smash (right)
        timestamp: u64
    }
    
    // Battle pairing
    public struct Battle has key, store {
        id: UID,
        tournament_id: address,
        nft1_id: address,
        nft2_id: address,
        votes_nft1: u64,
        smashes_nft1: u64,
        votes_nft2: u64,
        smashes_nft2: u64,
        status: u8,           // 0: Active, 1: Completed
        winner_id: Option<address>,
        created_at: u64
    }
    
    // User profile for tracking points and voting history
    public struct UserProfile has key, store {
        id: UID,
        user: address,
        points: u64,
        total_votes: u64,
        last_vote_time: u64,
        cooldown_period: u64   // Cooldown period in seconds
    }
    
    // Treasury to hold platform fees
    public struct Treasury has key, store {
        id: UID,
        balance: Balance<SUI>
    }
    
    // Constructor functions
    public fun new_admin_cap(ctx: &mut TxContext): AdminCap {
        AdminCap {
            id: object::new(ctx)
        }
    }
    
    public fun new_treasury(ctx: &mut TxContext): Treasury {
        Treasury {
            id: object::new(ctx),
            balance: balance::zero<SUI>()
        }
    }
    
    // Constructor for RegisteredNFT
    public fun new_registered_nft(
        original_id: address,
        owner: address,
        name: String,
        description: String,
        image_url: Url,
        registered_at: u64,
        ctx: &mut TxContext
    ): RegisteredNFT {
        RegisteredNFT {
            id: object::new(ctx),
            original_id,
            owner,
            name,
            description,
            image_url,
            registered_at,
            score: 0,
            tournament_wins: 0,
            total_votes: 0,
            total_smashes: 0
        }
    }
    
    // Destructor for RegisteredNFT
    public fun delete_registered_nft(nft: RegisteredNFT) {
        let RegisteredNFT {
            id,
            original_id: _,
            owner: _,
            name: _,
            description: _,
            image_url: _,
            registered_at: _,
            score: _,
            tournament_wins: _,
            total_votes: _,
            total_smashes: _
        } = nft;
        
        object::delete(id);
    }
    
    // Transfer functions
    public fun transfer_admin_cap(admin_cap: AdminCap, recipient: address) {
        transfer::public_transfer(admin_cap, recipient)
    }
    
    public fun share_treasury(treasury: Treasury) {
        transfer::public_share_object(treasury)
    }
    
    // Accessor functions for RegisteredNFT
    public fun nft_id(nft: &RegisteredNFT): &UID {
        &nft.id
    }
    
    public fun nft_original_id(nft: &RegisteredNFT): address {
        nft.original_id
    }
    
    public fun nft_owner(nft: &RegisteredNFT): address {
        nft.owner
    }
    
    public fun nft_name(nft: &RegisteredNFT): &String {
        &nft.name
    }
    
    public fun nft_description(nft: &RegisteredNFT): &String {
        &nft.description
    }
    
    public fun nft_image_url(nft: &RegisteredNFT): &Url {
        &nft.image_url
    }
    
    public fun nft_registered_at(nft: &RegisteredNFT): u64 {
        nft.registered_at
    }
    
    public fun nft_score(nft: &RegisteredNFT): u64 {
        nft.score
    }
    
    public fun nft_tournament_wins(nft: &RegisteredNFT): u64 {
        nft.tournament_wins
    }
    
    public fun nft_total_votes(nft: &RegisteredNFT): u64 {
        nft.total_votes
    }
    
    public fun nft_total_smashes(nft: &RegisteredNFT): u64 {
        nft.total_smashes
    }
    
    // Mutator functions for RegisteredNFT
    public fun set_nft_name(nft: &mut RegisteredNFT, name: String) {
        nft.name = name;
    }
    
    public fun set_nft_description(nft: &mut RegisteredNFT, description: String) {
        nft.description = description;
    }
    
    public fun set_nft_image_url(nft: &mut RegisteredNFT, image_url: Url) {
        nft.image_url = image_url;
    }
    
    public fun increase_nft_score(nft: &mut RegisteredNFT, points: u64) {
        nft.score = nft.score + points;
    }
    
    public fun increase_nft_tournament_wins(nft: &mut RegisteredNFT) {
        nft.tournament_wins = nft.tournament_wins + 1;
    }
    
    public fun increase_nft_total_votes(nft: &mut RegisteredNFT) {
        nft.total_votes = nft.total_votes + 1;
    }
    
    public fun increase_nft_total_smashes(nft: &mut RegisteredNFT) {
        nft.total_smashes = nft.total_smashes + 1;
    }
    
    // Accessor functions for Treasury
    public fun treasury_balance(treasury: &Treasury): &Balance<SUI> {
        &treasury.balance
    }
    
    public fun treasury_balance_mut(treasury: &mut Treasury): &mut Balance<SUI> {
        &mut treasury.balance
    }
    
    // Public getters for constants
    public fun winner_reward_percentage(): u64 { WINNER_REWARD_PERCENTAGE }
    public fun platform_fee_percentage(): u64 { PLATFORM_FEE_PERCENTAGE }
    public fun min_entry_fee(): u64 { MIN_ENTRY_FEE }
    
    // Tournament type getters
    public fun tournament_daily(): u8 { TOURNAMENT_DAILY }
    public fun tournament_weekly(): u8 { TOURNAMENT_WEEKLY }
    public fun tournament_monthly(): u8 { TOURNAMENT_MONTHLY }
    
    // Tournament status getters
    public fun status_upcoming(): u8 { STATUS_UPCOMING }
    public fun status_active(): u8 { STATUS_ACTIVE }
    public fun status_completed(): u8 { STATUS_COMPLETED }
    
    // Vote type getters
    public fun vote_pass(): u8 { VOTE_PASS }
    public fun vote_smash(): u8 { VOTE_SMASH }
    
    // Point value getters
    public fun points_daily(): u64 { POINTS_DAILY }
    public fun points_weekly(): u64 { POINTS_WEEKLY }
    public fun points_monthly(): u64 { POINTS_MONTHLY }
    
    // Error code getters
    public fun e_insufficient_fee(): u64 { EInsufficientFee }
    public fun e_invalid_tournament(): u64 { EInvalidTournament }
    public fun e_tournament_not_active(): u64 { ETournamentNotActive }
    public fun e_tournament_full(): u64 { ETournamentFull }
    public fun e_not_owner(): u64 { ENotOwner }
    public fun e_invalid_vote(): u64 { EInvalidVote }
    public fun e_cooldown_active(): u64 { ECooldownActive }
    public fun e_insufficient_points(): u64 { EInsufficientPoints }
    
    // Tournament related functions
    public fun new_tournament(
        tournament_type: u8,
        start_time: u64,
        end_time: u64,
        ctx: &mut TxContext
    ): Tournament {
        Tournament {
            id: object::new(ctx),
            name: string::utf8(b""), // Using string module function
            description: string::utf8(b""), // Using string module function
            start_time,
            end_time,
            status: STATUS_UPCOMING,
            prize_pool: balance::zero<SUI>(),
            entry_fee: MIN_ENTRY_FEE,
            max_participants: 100,
            current_participants: 0,
            tournament_type,
            participants: vector::empty<address>(),
            winner: option::none()
        }
    }

    // Tournament accessor functions
    public fun tournament_id(tournament: &Tournament): &UID {
        &tournament.id
    }

    public fun tournament_name(tournament: &Tournament): &String {
        &tournament.name
    }

    public fun tournament_description(tournament: &Tournament): &String {
        &tournament.description
    }

    public fun tournament_start_time(tournament: &Tournament): u64 {
        tournament.start_time
    }

    public fun tournament_end_time(tournament: &Tournament): u64 {
        tournament.end_time
    }

    public fun tournament_status(tournament: &Tournament): u8 {
        tournament.status
    }

    public fun tournament_prize_pool(tournament: &Tournament): &Balance<SUI> {
        &tournament.prize_pool
    }

    public fun tournament_prize_pool_mut(tournament: &mut Tournament): &mut Balance<SUI> {
        &mut tournament.prize_pool
    }

    public fun tournament_entry_fee(tournament: &Tournament): u64 {
        tournament.entry_fee
    }

    public fun tournament_max_participants(tournament: &Tournament): u64 {
        tournament.max_participants
    }

    public fun tournament_current_participants(tournament: &Tournament): u64 {
        tournament.current_participants
    }

    public fun tournament_type(tournament: &Tournament): u8 {
        tournament.tournament_type
    }

    public fun tournament_participants(tournament: &Tournament): &vector<address> {
        &tournament.participants
    }

    public fun tournament_winner(tournament: &Tournament): &Option<address> {
        &tournament.winner
    }

    // Tournament mutator functions
    public fun set_tournament_name(tournament: &mut Tournament, name: String) {
        tournament.name = name;
    }

    public fun set_tournament_description(tournament: &mut Tournament, description: String) {
        tournament.description = description;
    }

    public fun set_tournament_status(tournament: &mut Tournament, status: u8) {
        tournament.status = status;
    }

    public fun set_tournament_started(tournament: &mut Tournament, started: bool) {
        if (started) {
            tournament.status = STATUS_ACTIVE;
        }
    }

    public fun set_tournament_ended(tournament: &mut Tournament, ended: bool) {
        if (ended) {
            tournament.status = STATUS_COMPLETED;
        }
    }

    public fun tournament_is_started(tournament: &Tournament): bool {
        tournament.status == STATUS_ACTIVE
    }

    public fun tournament_is_ended(tournament: &Tournament): bool {
        tournament.status == STATUS_COMPLETED
    }

    public fun set_tournament_winner(tournament: &mut Tournament, winner_id: Option<address>) {
        tournament.winner = winner_id;
    }

    public fun add_participant(tournament: &mut Tournament, nft_id: address) {
        vector::push_back(&mut tournament.participants, nft_id);
        tournament.current_participants = tournament.current_participants + 1;
    }

    public fun add_to_prize_pool(tournament: &mut Tournament, coin: Coin<SUI>) {
        let coin_balance = coin::into_balance(coin);
        balance::join(&mut tournament.prize_pool, coin_balance);
    }

    // NFT tournament participation functions
    public fun nft_in_tournament(_nft: &RegisteredNFT): bool {
        // This will be implemented later when we add tournament participation tracking to NFTs
        false
    }

    public fun add_nft_to_tournament(_nft: &mut RegisteredNFT, _tournament_id: address) {
        // This will be implemented later when we add tournament participation tracking to NFTs
    }

    // Treasury functions
    public fun add_to_treasury(treasury: &mut Treasury, coin: Coin<SUI>) {
        let coin_balance = coin::into_balance(coin);
        balance::join(&mut treasury.balance, coin_balance);
    }

    // UserProfile related functions
    public fun new_user_profile(
        user: address,
        ctx: &mut TxContext
    ): UserProfile {
        UserProfile {
            id: object::new(ctx),
            user,
            points: 0,
            total_votes: 0,
            last_vote_time: 0,
            cooldown_period: 3600000 // 1 hour cooldown in milliseconds
        }
    }

    // UserProfile accessor functions
    public fun user_profile_id(profile: &UserProfile): &UID {
        &profile.id
    }

    public fun user_profile_user(profile: &UserProfile): address {
        profile.user
    }

    public fun user_profile_points(profile: &UserProfile): u64 {
        profile.points
    }

    public fun user_total_votes(profile: &UserProfile): u64 {
        profile.total_votes
    }

    public fun user_last_vote_time(profile: &UserProfile): u64 {
        profile.last_vote_time
    }

    public fun user_cooldown_period(profile: &UserProfile): u64 {
        profile.cooldown_period
    }

    // UserProfile mutator functions
    public fun increase_user_points(profile: &mut UserProfile, points: u64) {
        profile.points = profile.points + points;
    }

    public fun increase_user_total_votes(profile: &mut UserProfile) {
        profile.total_votes = profile.total_votes + 1;
    }

    public fun set_user_last_vote_time(profile: &mut UserProfile, time: u64) {
        profile.last_vote_time = time;
    }

    public fun set_user_cooldown_period(profile: &mut UserProfile, period: u64) {
        profile.cooldown_period = period;
    }
}
