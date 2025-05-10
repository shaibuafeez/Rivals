module rivals_tournament::tournament {
    // Import standard libraries
    use std::string::String;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::table::{Self, Table};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::balance::{Self, Balance};
    
    // Import project modules
    use rivals_tournament::storage;
    
    // Error codes
    const EInvalidTournamentType: u64 = 1;
    const ETournamentNotActive: u64 = 2;
    const ETournamentEnded: u64 = 3;
    const EInvalidNFT: u64 = 4;
    const EInsufficientEntryFee: u64 = 5;
    const EAlreadyVoted: u64 = 6;
    const ENotAdmin: u64 = 8;
    const ENFTAlreadyRegistered: u64 = 9;
    const ETournamentNotEnded: u64 = 10;
    const EInvalidPrizeDistribution: u64 = 11;
    
    // Prize distribution constants
    const MIN_PARTICIPANTS_FOR_TOP_THREE: u64 = 5;
    const FIRST_PLACE_PERCENTAGE: u64 = 6000; // 60%
    const SECOND_PLACE_PERCENTAGE: u64 = 3000; // 30%
    const THIRD_PLACE_PERCENTAGE: u64 = 1000; // 10%
    
    // Tournament types
    const TOURNAMENT_TYPE_DAILY: u8 = 1;
    const TOURNAMENT_TYPE_WEEKLY: u8 = 2;
    const TOURNAMENT_TYPE_MONTHLY: u8 = 3;
    
    // Tournament status
    const STATUS_ACTIVE: u8 = 1;
    const STATUS_ENDED: u8 = 2;
    
    // Tournament struct
    public struct Tournament has key {
        id: UID,
        name: String,
        description: String,
        tournament_type: u8,
        status: u8,
        start_time: u64,
        end_time: u64,
        entry_fee: u64,
        prize_pool: Balance<SUI>,
        admin: address,
        participants: Table<ID, NFTEntry>,
        votes: Table<address, vector<ID>>,
        total_participants: u64,
        winners: vector<Winner>,
    }
    
    // Winner struct to track prize distribution
    public struct Winner has store, copy, drop {
        nft_id: ID,
        owner: address,
        rank: u64,
        prize_amount: u64,
    }
    
    // NFT Entry struct
    public struct NFTEntry has store {
        nft_id: ID,
        owner: address,
        votes: u64,
        registration_time: u64,
        // Reference to the NFT image stored on Walrus
        walrus_blob_id: Option<ID>,
        blob_hash: Option<vector<u8>>,
    }
    
    // Tournament Registry to keep track of all tournaments
    public struct TournamentRegistry has key {
        id: UID,
        admin: address,
        active_tournaments: vector<ID>,
        ended_tournaments: vector<ID>,
    }
    
    // Events
    public struct TournamentCreatedEvent has copy, drop {
        tournament_id: ID,
        name: String,
        tournament_type: u8,
        start_time: u64,
        end_time: u64,
        entry_fee: u64,
    }
    
    public struct NFTRegisteredEvent has copy, drop {
        tournament_id: ID,
        nft_id: ID,
        owner: address,
    }
    
    public struct VoteCastEvent has copy, drop {
        tournament_id: ID,
        nft_id: ID,
        voter: address,
    }
    
    public struct TournamentEndedEvent has copy, drop {
        tournament_id: ID,
        winner_nft_id: ID,
        winner_address: address,
        prize_amount: u64,
    }
    
    public struct PrizeDistributedEvent has copy, drop {
        tournament_id: ID,
        nft_id: ID,
        owner: address,
        rank: u64,
        prize_amount: u64,
    }
    
    // Initialize the tournament registry
    fun init(ctx: &mut TxContext) {
        let registry = TournamentRegistry {
            id: object::new(ctx),
            admin: tx_context::sender(ctx),
            active_tournaments: vector::empty(),
            ended_tournaments: vector::empty(),
        };
        
        transfer::share_object(registry);
    }
    
    #[test_only]
    /// Create a tournament registry for testing
    public fun create_registry_for_testing(ctx: &mut TxContext) {
        let registry = TournamentRegistry {
            id: object::new(ctx),
            admin: tx_context::sender(ctx),
            active_tournaments: vector::empty(),
            ended_tournaments: vector::empty(),
        };
        
        transfer::share_object(registry);
    }
    
    // Create a new tournament
    public fun create_tournament(
        registry: &mut TournamentRegistry,
        name: String,
        description: String,
        tournament_type: u8,
        duration_hours: u64,
        entry_fee: u64,
        initial_prize: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify the tournament type is valid
        assert!(
            tournament_type == TOURNAMENT_TYPE_DAILY || 
            tournament_type == TOURNAMENT_TYPE_WEEKLY || 
            tournament_type == TOURNAMENT_TYPE_MONTHLY,
            EInvalidTournamentType
        );
        
        // Verify the creator is the admin
        assert!(tx_context::sender(ctx) == registry.admin, ENotAdmin);
        
        // Calculate end time based on tournament type
        let start_time = clock::timestamp_ms(clock);
        let end_time = start_time + (duration_hours * 3600000); // Convert hours to milliseconds
        
        // Create the tournament
        let tournament = Tournament {
            id: object::new(ctx),
            name,
            description,
            tournament_type,
            status: STATUS_ACTIVE,
            start_time,
            end_time,
            entry_fee,
            prize_pool: coin::into_balance(initial_prize),
            admin: tx_context::sender(ctx),
            participants: table::new(ctx),
            votes: table::new(ctx),
            total_participants: 0,
            winners: vector::empty(),
        };
        
        let tournament_id = object::id(&tournament);
        
        // Add to active tournaments
        vector::push_back(&mut registry.active_tournaments, tournament_id);
        
        // Emit event
        event::emit(TournamentCreatedEvent {
            tournament_id,
            name: tournament.name,
            tournament_type,
            start_time,
            end_time,
            entry_fee,
        });
        
        // Share the tournament object
        transfer::share_object(tournament);
    }
    
    // Register an NFT to a tournament
    public fun register_nft(
        tournament: &mut Tournament,
        nft_id: ID,
        entry_fee_payment: &mut Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify tournament is active
        assert!(tournament.status == STATUS_ACTIVE, ETournamentNotActive);
        
        // Verify tournament hasn't ended
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time < tournament.end_time, ETournamentEnded);
        
        // Verify NFT isn't already registered
        assert!(!table::contains(&tournament.participants, nft_id), ENFTAlreadyRegistered);
        
        // Verify sufficient entry fee
        assert!(coin::value(entry_fee_payment) >= tournament.entry_fee, EInsufficientEntryFee);
        
        // Extract entry fee from payment
        let entry_fee_coin = coin::split(entry_fee_payment, tournament.entry_fee, ctx);
        
        // Add to prize pool
        balance::join(&mut tournament.prize_pool, coin::into_balance(entry_fee_coin));
        
        // Register the NFT
        let nft_entry = NFTEntry {
            nft_id,
            owner: tx_context::sender(ctx),
            votes: 0,
            registration_time: current_time,
            walrus_blob_id: option::none(),
            blob_hash: option::none(),
        };
        
        table::add(&mut tournament.participants, nft_id, nft_entry);
        tournament.total_participants = tournament.total_participants + 1;
        
        // Emit event
        event::emit(NFTRegisteredEvent {
            tournament_id: object::id(tournament),
            nft_id,
            owner: tx_context::sender(ctx),
        });
    }
    
    // Register an NFT with an image stored on Walrus
    public fun register_nft_with_image(
        tournament: &mut Tournament,
        nft_id: ID,
        walrus_blob_id: ID,
        blob_hash: vector<u8>,
        entry_fee_payment: &mut Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify tournament is active
        assert!(tournament.status == STATUS_ACTIVE, ETournamentNotActive);
        
        // Verify tournament hasn't ended
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time < tournament.end_time, ETournamentEnded);
        
        // Verify NFT isn't already registered
        assert!(!table::contains(&tournament.participants, nft_id), ENFTAlreadyRegistered);
        
        // Verify sufficient entry fee
        assert!(coin::value(entry_fee_payment) >= tournament.entry_fee, EInsufficientEntryFee);
        
        // Extract entry fee from payment
        let entry_fee_coin = coin::split(entry_fee_payment, tournament.entry_fee, ctx);
        
        // Add to prize pool
        balance::join(&mut tournament.prize_pool, coin::into_balance(entry_fee_coin));
        
        // Register the NFT with image reference
        let nft_entry = NFTEntry {
            nft_id,
            owner: tx_context::sender(ctx),
            votes: 0,
            registration_time: current_time,
            walrus_blob_id: option::some(walrus_blob_id),
            blob_hash: option::some(blob_hash),
        };
        
        // Create an NFT image reference on-chain
        storage::create_and_transfer_nft_image_reference(nft_id, walrus_blob_id, blob_hash, ctx);
        
        table::add(&mut tournament.participants, nft_id, nft_entry);
        tournament.total_participants = tournament.total_participants + 1;
        
        // Emit event
        event::emit(NFTRegisteredEvent {
            tournament_id: object::id(tournament),
            nft_id,
            owner: tx_context::sender(ctx),
        });
    }
    
    // Vote for an NFT
    public fun vote_for_nft(
        tournament: &mut Tournament,
        nft_id: ID,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify tournament is active
        assert!(tournament.status == STATUS_ACTIVE, ETournamentNotActive);
        
        // Verify tournament hasn't ended
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time < tournament.end_time, ETournamentEnded);
        
        // Verify NFT is registered
        assert!(table::contains(&tournament.participants, nft_id), EInvalidNFT);
        
        let voter = tx_context::sender(ctx);
        
        // Initialize votes vector for this voter if it doesn't exist
        if (!table::contains(&tournament.votes, voter)) {
            table::add(&mut tournament.votes, voter, vector::empty());
        };
        
        // Get voter's votes
        let voter_votes = table::borrow_mut(&mut tournament.votes, voter);
        
        // Check if voter has already voted for this NFT
        let mut i = 0;
        let len = vector::length(voter_votes);
        let mut already_voted = false;
        
        while (i < len) {
            if (*vector::borrow(voter_votes, i) == nft_id) {
                already_voted = true;
                break
            };
            i = i + 1;
        };
        
        assert!(!already_voted, EAlreadyVoted);
        
        // Add vote
        vector::push_back(voter_votes, nft_id);
        
        // Increment NFT votes
        let nft_entry = table::borrow_mut(&mut tournament.participants, nft_id);
        nft_entry.votes = nft_entry.votes + 1;
        
        // Emit event
        event::emit(VoteCastEvent {
            tournament_id: object::id(tournament),
            nft_id,
            voter,
        });
    }
    
    // End tournament and distribute prizes
    public fun end_tournament(
        registry: &mut TournamentRegistry,
        tournament: &mut Tournament,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify caller is admin
        assert!(tx_context::sender(ctx) == tournament.admin, ENotAdmin);
        
        // Verify tournament is active
        assert!(tournament.status == STATUS_ACTIVE, ETournamentNotActive);
        
        // Verify tournament has ended based on time
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time >= tournament.end_time, ETournamentNotEnded);
        
        // Find the top participants by votes
        let mut top_nfts: vector<(ID, u64)> = vector::empty(); // (nft_id, votes)
        
        // Get all participant NFT IDs
        let nft_ids = table::keys(&tournament.participants);
        let participants_count = vector::length(&nft_ids);
        
        // Create a vector of (nft_id, votes) pairs for sorting
        let i = 0;
        while (i < participants_count) {
            let nft_id = *vector::borrow(&nft_ids, i);
            let entry = table::borrow(&tournament.participants, nft_id);
            vector::push_back(&mut top_nfts, (nft_id, entry.votes));
            i = i + 1;
        };
        
        // Sort by votes (descending) using bubble sort
        let j = 0;
        while (j < participants_count) {
            let k = 0;
            while (k < participants_count - j - 1) {
                let (_, votes1) = *vector::borrow(&top_nfts, k);
                let (_, votes2) = *vector::borrow(&top_nfts, k + 1);
                
                if (votes1 < votes2) {
                    // Swap
                    vector::swap(&mut top_nfts, k, k + 1);
                };
                
                k = k + 1;
            };
            j = j + 1;
        };
        
        // Update tournament status
        tournament.status = STATUS_ENDED;
        
        // Move tournament from active to ended in registry
        let tournament_id = object::id(tournament);
        let (contains, index) = vector::index_of(&registry.active_tournaments, &tournament_id);
        
        if (contains) {
            vector::remove(&mut registry.active_tournaments, index);
            vector::push_back(&mut registry.ended_tournaments, tournament_id);
        };
        
        // Distribute prizes based on participant count
        let prize_pool_value = balance::value(&tournament.prize_pool);
        
        if (participants_count > 0) {
            if (participants_count < MIN_PARTICIPANTS_FOR_TOP_THREE) {
                // Winner takes all
                if (vector::length(&top_nfts) > 0) {
                    let (winner_id, _) = *vector::borrow(&top_nfts, 0);
                    let winner_entry = table::borrow(&tournament.participants, winner_id);
                    let winner_address = winner_entry.owner;
                    
                    // Take prize amount
                    let prize_balance = balance::split(&mut tournament.prize_pool, prize_pool_value);
                    
                    // Create coin from balance and transfer to winner
                    let prize = coin::from_balance(prize_balance, ctx);
                    transfer::public_transfer(prize, winner_address);
                    
                    // Record winner in tournament
                    let winner = Winner {
                        nft_id: winner_id,
                        owner: winner_address,
                        rank: 1,
                        prize_amount: prize_pool_value,
                    };
                    vector::push_back(&mut tournament.winners, winner);
                    
                    // Emit events
                    event::emit(TournamentEndedEvent {
                        tournament_id,
                        winner_nft_id: winner_id,
                        winner_address,
                        prize_amount: prize_pool_value,
                    });
                    
                    event::emit(PrizeDistributedEvent {
                        tournament_id,
                        nft_id: winner_id,
                        owner: winner_address,
                        rank: 1,
                        prize_amount: prize_pool_value,
                    });
                };
            } else {
                // Top 3 distribution
                // Calculate prize amounts
                let first_prize = (prize_pool_value * FIRST_PLACE_PERCENTAGE) / 10000;
                let second_prize = (prize_pool_value * SECOND_PLACE_PERCENTAGE) / 10000;
                let third_prize = (prize_pool_value * THIRD_PLACE_PERCENTAGE) / 10000;
                
                // Distribute to top 3 if we have enough participants
                let max_winners = if (participants_count >= 3) { 3 } else { participants_count };
                
                let p = 0;
                while (p < max_winners) {
                    if (p < vector::length(&top_nfts)) {
                        let (nft_id, _) = *vector::borrow(&top_nfts, p);
                        let entry = table::borrow(&tournament.participants, nft_id);
                        let owner_addr = entry.owner;
                        let rank = p + 1;
                        
                        // Determine prize amount based on rank
                        let prize_amount = if (rank == 1) { first_prize }
                                          else if (rank == 2) { second_prize }
                                          else { third_prize };
                        
                        // Split prize from pool
                        let prize_balance = balance::split(&mut tournament.prize_pool, prize_amount);
                        let prize = coin::from_balance(prize_balance, ctx);
                        
                        // Transfer prize
                        transfer::public_transfer(prize, owner_addr);
                        
                        // Record winner
                        let winner = Winner {
                            nft_id,
                            owner: owner_addr,
                            rank,
                            prize_amount,
                        };
                        vector::push_back(&mut tournament.winners, winner);
                        
                        // Emit event for each prize distribution
                        event::emit(PrizeDistributedEvent {
                            tournament_id,
                            nft_id,
                            owner: owner_addr,
                            rank,
                            prize_amount,
                        });
                        
                        // Emit main winner event for first place
                        if (rank == 1) {
                            event::emit(TournamentEndedEvent {
                                tournament_id,
                                winner_nft_id: nft_id,
                                winner_address: owner_addr,
                                prize_amount,
                            });
                        };
                    };
                    
                    p = p + 1;
                };
            };
        };
    }
    
    // Get tournament details
    public fun get_tournament_details(tournament: &Tournament): (String, String, u8, u8, u64, u64, u64, u64, u64) {
        (
            tournament.name,
            tournament.description,
            tournament.tournament_type,
            tournament.status,
            tournament.start_time,
            tournament.end_time,
            tournament.entry_fee,
            balance::value(&tournament.prize_pool),
            tournament.total_participants
        )
    }
    
    // Get NFT entry details
    public fun get_nft_entry(tournament: &Tournament, nft_id: ID): (address, u64, u64) {
        let entry = table::borrow(&tournament.participants, nft_id);
        (entry.owner, entry.votes, entry.registration_time)
    }
    
    // Get tournament winners
    public fun get_tournament_winners(tournament: &Tournament): vector<Winner> {
        tournament.winners
    }
    
    // Get total participants
    public fun get_total_participants(tournament: &Tournament): u64 {
        tournament.total_participants
    }
    
    // Check if user has voted for an NFT
    public fun has_voted_for_nft(tournament: &Tournament, voter: address, nft_id: ID): bool {
        if (!table::contains(&tournament.votes, voter)) {
            return false
        };
        
        let voter_votes = table::borrow(&tournament.votes, voter);
        let mut i = 0;
        let len = vector::length(voter_votes);
        
        while (i < len) {
            if (*vector::borrow(voter_votes, i) == nft_id) {
                return true
            };
            i = i + 1;
        };
        
        false
    }
    
    // Create a custom tournament (for future implementation)
    public fun create_custom_tournament(
        registry: &mut TournamentRegistry,
        name: String,
        description: String,
        duration_hours: u64,
        entry_fee: u64,
        initial_prize: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Create a custom tournament with type = 0 (custom)
        // This is a simplified version that can be expanded later
        
        // Calculate end time
        let start_time = clock::timestamp_ms(clock);
        let end_time = start_time + (duration_hours * 3600000);
        
        // Create the tournament
        let tournament = Tournament {
            id: object::new(ctx),
            name,
            description,
            tournament_type: 0, // Custom type
            status: STATUS_ACTIVE,
            start_time,
            end_time,
            entry_fee,
            prize_pool: coin::into_balance(initial_prize),
            admin: tx_context::sender(ctx),
            participants: table::new(ctx),
            votes: table::new(ctx),
            total_participants: 0,
            winners: vector::empty(),
        };
        
        let tournament_id = object::id(&tournament);
        
        // Add to active tournaments
        vector::push_back(&mut registry.active_tournaments, tournament_id);
        
        // Emit event
        event::emit(TournamentCreatedEvent {
            tournament_id,
            name: tournament.name,
            tournament_type: 0,
            start_time,
            end_time,
            entry_fee,
        });
        
        // Share the tournament object
        transfer::share_object(tournament);
    }
}
