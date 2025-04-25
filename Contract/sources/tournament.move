module rival_contract::tournament {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::TxContext;
    use sui::event;
    use sui::transfer;
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use std::vector;
    use std::option::{Self, Option};

    use rival_contract::types::{Self, AdminCap, Treasury, RegisteredNFT, Tournament};

    // ======== Events ========
    public struct TournamentCreated has copy, drop {
        tournament_id: ID,
        tournament_type: u8,
        start_time: u64,
        end_time: u64
    }

    public struct TournamentStarted has copy, drop {
        tournament_id: ID,
        tournament_type: u8,
        start_time: u64
    }

    public struct TournamentEnded has copy, drop {
        tournament_id: ID,
        tournament_type: u8,
        end_time: u64,
        winner_id: Option<ID>
    }

    public struct NFTJoinedTournament has copy, drop {
        tournament_id: ID,
        nft_id: ID,
        owner: address
    }

    // ======== Error codes ========
    const EInvalidTournamentType: u64 = 100;
    const EInvalidTournamentTime: u64 = 101;
    const ETournamentNotStarted: u64 = 102;
    const ETournamentEnded: u64 = 103;
    const ENFTAlreadyInTournament: u64 = 104;
    const EInvalidEntryFee: u64 = 105;
    const ETournamentAlreadyStarted: u64 = 106;
    const ETournamentNotEnded: u64 = 107;
    const ETournamentAlreadyEnded: u64 = 108;
    const ENTRY_FEE: u64 = 1_000_000_000; // 1 SUI in MIST

    // ======== Functions ========

    /// Create a new tournament
    public fun create_tournament(
        _: &AdminCap,
        tournament_type: u8,
        start_time: u64,
        end_time: u64,
        ctx: &mut TxContext
    ) {
        // Validate tournament type
        assert!(tournament_type <= 2, EInvalidTournamentType);
        
        // Validate tournament times
        assert!(start_time < end_time, EInvalidTournamentTime);

        // Create tournament object
        let tournament = types::new_tournament(
            tournament_type,
            start_time,
            end_time,
            ctx
        );

        // Get tournament ID before sharing
        let id_bytes = object::uid_to_bytes(types::tournament_id(&tournament));
        let tournament_id = object::uid_to_inner(types::tournament_id(&tournament));

        // Emit event
        event::emit(TournamentCreated {
            tournament_id,
            tournament_type,
            start_time,
            end_time
        });

        // Share tournament object
        transfer::public_share_object(tournament);
    }

    /// Join a tournament with an NFT
    public fun join_tournament(
        nft: &mut RegisteredNFT,
        tournament: &mut Tournament,
        clock: &Clock,
        entry_fee: Coin<SUI>,
        treasury: &mut Treasury,
        ctx: &mut TxContext
    ) {
        // Check if tournament is active
        let current_time = clock::timestamp_ms(clock);
        let start_time = types::tournament_start_time(tournament);
        let end_time = types::tournament_end_time(tournament);

        // Tournament must be active (current time between start and end)
        assert!(current_time >= start_time, ETournamentNotStarted);
        assert!(current_time < end_time, ETournamentEnded);

        // Check if NFT is already in a tournament
        assert!(!types::nft_in_tournament(nft), ENFTAlreadyInTournament);

        // Check entry fee
        let fee_amount = coin::value(&entry_fee);
        assert!(fee_amount == ENTRY_FEE, EInvalidEntryFee);

        // Add entry fee to treasury
        types::add_to_treasury(treasury, entry_fee);

        // Get IDs for events
        let tournament_id = object::uid_to_inner(types::tournament_id(tournament));
        let nft_id = object::uid_to_inner(types::nft_id(nft));
        
        // Get address for tournament tracking
        let tournament_id_addr = object::uid_to_address(types::tournament_id(tournament));

        // Add NFT to tournament
        types::add_nft_to_tournament(nft, tournament_id_addr);
        types::add_participant(tournament, types::nft_owner(nft));

        // Emit event
        event::emit(NFTJoinedTournament {
            tournament_id,
            nft_id,
            owner: types::nft_owner(nft)
        });
    }

    /// Start a tournament (admin only)
    public fun start_tournament(
        _: &AdminCap,
        tournament: &mut Tournament,
        clock: &Clock
    ) {
        // Check if tournament can be started
        let current_time = clock::timestamp_ms(clock);
        let start_time = types::tournament_start_time(tournament);
        
        // Tournament must be in the future and not already started
        assert!(current_time >= start_time, ETournamentNotStarted);
        assert!(!types::tournament_is_started(tournament), ETournamentAlreadyStarted);

        // Start tournament
        types::set_tournament_started(tournament, true);

        // Emit event
        let tournament_id = object::uid_to_inner(types::tournament_id(tournament));
        event::emit(TournamentStarted {
            tournament_id,
            tournament_type: types::tournament_type(tournament),
            start_time
        });
    }

    /// End a tournament (admin only)
    public fun end_tournament(
        _: &AdminCap,
        tournament: &mut Tournament,
        clock: &Clock
    ) {
        // Check if tournament can be ended
        let current_time = clock::timestamp_ms(clock);
        let end_time = types::tournament_end_time(tournament);
        
        // Tournament must be past end time and not already ended
        assert!(current_time >= end_time, ETournamentNotEnded);
        assert!(!types::tournament_is_ended(tournament), ETournamentAlreadyEnded);

        // End tournament
        types::set_tournament_ended(tournament, true);

        // Emit event
        let tournament_id = object::uid_to_inner(types::tournament_id(tournament));
        event::emit(TournamentEnded {
            tournament_id,
            tournament_type: types::tournament_type(tournament),
            end_time,
            winner_id: option::none()
        });
    }
}
