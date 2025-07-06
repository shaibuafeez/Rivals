module rivals_tournament::simple_tournament {
    use std::string::{Self, String};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::balance::{Self, Balance};
    use sui::event;
    
    // Constants
    const ENTRY_FEE: u64 = 10_000_000; // 0.01 SUI
    const MIN_PARTICIPANTS: u64 = 5;
    
    // Error codes
    const ETournamentEnded: u64 = 1;
    const ETournamentNotEnded: u64 = 2;
    const EInsufficientPayment: u64 = 3;
    const EAlreadyVoted: u64 = 4;
    const EInvalidNFT: u64 = 5;
    const ETournamentAlreadyFinalized: u64 = 6;
    
    // Tournament object
    public struct Tournament has key {
        id: UID,
        name: String,
        description: String,
        banner_url: String,
        end_time: u64,
        entries: vector<Entry>,
        voters: vector<address>, // Track who has voted
        prize_pool: Balance<SUI>,
        ended: bool,
    }
    
    // Entry struct
    public struct Entry has store, drop, copy {
        nft_id: ID,
        submitter: address,
        image_url: String,
        vote_count: u64,
    }
    
    // Events
    public struct TournamentCreated has copy, drop {
        tournament_id: ID,
        name: String,
        end_time: u64,
    }
    
    public struct EntrySubmitted has copy, drop {
        tournament_id: ID,
        nft_id: ID,
        submitter: address,
    }
    
    public struct VoteCast has copy, drop {
        tournament_id: ID,
        nft_id: ID,
        voter: address,
    }
    
    public struct TournamentEnded has copy, drop {
        tournament_id: ID,
        total_entries: u64,
        total_prize: u64,
    }
    
    public struct PrizeDistributed has copy, drop {
        tournament_id: ID,
        winner: address,
        rank: u64,
        amount: u64,
    }
    
    // Create a new tournament
    public entry fun create_tournament(
        name: vector<u8>,
        description: vector<u8>,
        banner_url: vector<u8>,
        duration_hours: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let tournament = Tournament {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            banner_url: string::utf8(banner_url),
            end_time: clock::timestamp_ms(clock) + (duration_hours * 3600 * 1000),
            entries: vector::empty(),
            voters: vector::empty(),
            prize_pool: balance::zero(),
            ended: false,
        };
        
        let tournament_id = object::id(&tournament);
        
        event::emit(TournamentCreated {
            tournament_id,
            name: tournament.name,
            end_time: tournament.end_time,
        });
        
        transfer::share_object(tournament);
    }
    
    // Enter tournament with NFT (0.01 SUI entry fee)
    // Note: For simplicity, we trust the frontend to only submit Azur Guardian NFTs
    // Proper on-chain validation would require complex type introspection
    public entry fun enter_tournament(
        tournament: &mut Tournament,
        nft_id_bytes: address, // NFT ID as address
        image_url: vector<u8>,
        payment: &mut Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Check tournament hasn't ended
        assert!(clock::timestamp_ms(clock) < tournament.end_time, ETournamentEnded);
        assert!(!tournament.ended, ETournamentEnded);
        
        // Check payment amount
        let payment_value = coin::value(payment);
        assert!(payment_value >= ENTRY_FEE, EInsufficientPayment);
        
        // Take entry fee (0.01 SUI)
        let entry_fee = coin::split(payment, ENTRY_FEE, ctx);
        balance::join(&mut tournament.prize_pool, coin::into_balance(entry_fee));
        
        // Create entry
        let nft_id = object::id_from_address(nft_id_bytes);
        let entry = Entry {
            nft_id,
            submitter: tx_context::sender(ctx),
            image_url: string::utf8(image_url),
            vote_count: 0,
        };
        
        // Add to entries
        vector::push_back(&mut tournament.entries, entry);
        
        event::emit(EntrySubmitted {
            tournament_id: object::id(tournament),
            nft_id,
            submitter: tx_context::sender(ctx),
        });
    }
    
    // Vote for an NFT (anyone can vote)
    public entry fun vote(
        tournament: &mut Tournament,
        nft_id_bytes: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Check tournament hasn't ended
        assert!(clock::timestamp_ms(clock) < tournament.end_time, ETournamentEnded);
        assert!(!tournament.ended, ETournamentEnded);
        
        let voter = tx_context::sender(ctx);
        
        // Check if already voted
        let mut i = 0;
        let voters_len = vector::length(&tournament.voters);
        while (i < voters_len) {
            if (vector::borrow(&tournament.voters, i) == &voter) {
                assert!(false, EAlreadyVoted);
            };
            i = i + 1;
        };
        
        // Add voter to list
        vector::push_back(&mut tournament.voters, voter);
        
        // Find NFT and increment vote count
        let nft_id = object::id_from_address(nft_id_bytes);
        let mut found = false;
        let mut j = 0;
        let entries_len = vector::length(&tournament.entries);
        
        while (j < entries_len) {
            let entry = vector::borrow_mut(&mut tournament.entries, j);
            if (entry.nft_id == nft_id) {
                entry.vote_count = entry.vote_count + 1;
                found = true;
                break
            };
            j = j + 1;
        };
        
        assert!(found, EInvalidNFT);
        
        event::emit(VoteCast {
            tournament_id: object::id(tournament),
            nft_id,
            voter,
        });
    }
    
    // End tournament and distribute prizes
    public entry fun end_tournament(
        tournament: &mut Tournament,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Check tournament has ended
        assert!(clock::timestamp_ms(clock) >= tournament.end_time, ETournamentNotEnded);
        assert!(!tournament.ended, ETournamentAlreadyFinalized);
        
        tournament.ended = true;
        
        let total_entries = vector::length(&tournament.entries);
        let total_prize = balance::value(&tournament.prize_pool);
        
        event::emit(TournamentEnded {
            tournament_id: object::id(tournament),
            total_entries,
            total_prize,
        });
        
        // If less than minimum participants, refund all
        if (total_entries < MIN_PARTICIPANTS) {
            let mut i = 0;
            while (i < total_entries) {
                let entry = vector::borrow(&tournament.entries, i);
                if (balance::value(&tournament.prize_pool) >= ENTRY_FEE) {
                    let refund = coin::from_balance(
                        balance::split(&mut tournament.prize_pool, ENTRY_FEE),
                        ctx
                    );
                    transfer::public_transfer(refund, entry.submitter);
                };
                i = i + 1;
            };
            return
        };
        
        // Sort entries by vote count (simple bubble sort for small arrays)
        let mut sorted_entries = tournament.entries;
        let n = vector::length(&sorted_entries);
        let mut i = 0;
        
        while (i < n) {
            let mut j = 0;
            while (j < n - i - 1) {
                let entry_j = vector::borrow(&sorted_entries, j);
                let entry_j_plus_1 = vector::borrow(&sorted_entries, j + 1);
                
                if (entry_j.vote_count < entry_j_plus_1.vote_count) {
                    // Swap entries
                    let temp = *entry_j;
                    *vector::borrow_mut(&mut sorted_entries, j) = *entry_j_plus_1;
                    *vector::borrow_mut(&mut sorted_entries, j + 1) = temp;
                };
                j = j + 1;
            };
            i = i + 1;
        };
        
        // Distribute prizes to top 3
        let first_prize = total_prize * 60 / 100;
        let second_prize = total_prize * 30 / 100;
        let third_prize = total_prize * 10 / 100;
        
        // First place
        if (total_entries >= 1 && first_prize > 0) {
            let winner = vector::borrow(&sorted_entries, 0);
            let prize = coin::from_balance(
                balance::split(&mut tournament.prize_pool, first_prize),
                ctx
            );
            transfer::public_transfer(prize, winner.submitter);
            
            event::emit(PrizeDistributed {
                tournament_id: object::id(tournament),
                winner: winner.submitter,
                rank: 1,
                amount: first_prize,
            });
        };
        
        // Second place
        if (total_entries >= 2 && second_prize > 0) {
            let winner = vector::borrow(&sorted_entries, 1);
            let prize = coin::from_balance(
                balance::split(&mut tournament.prize_pool, second_prize),
                ctx
            );
            transfer::public_transfer(prize, winner.submitter);
            
            event::emit(PrizeDistributed {
                tournament_id: object::id(tournament),
                winner: winner.submitter,
                rank: 2,
                amount: second_prize,
            });
        };
        
        // Third place
        if (total_entries >= 3 && third_prize > 0) {
            let winner = vector::borrow(&sorted_entries, 2);
            let prize = coin::from_balance(
                balance::split(&mut tournament.prize_pool, third_prize),
                ctx
            );
            transfer::public_transfer(prize, winner.submitter);
            
            event::emit(PrizeDistributed {
                tournament_id: object::id(tournament),
                winner: winner.submitter,
                rank: 3,
                amount: third_prize,
            });
        };
    }
    
    // View functions
    public fun get_tournament_info(tournament: &Tournament): (String, String, String, u64, bool, u64) {
        (
            tournament.name,
            tournament.description,
            tournament.banner_url,
            tournament.end_time,
            tournament.ended,
            balance::value(&tournament.prize_pool)
        )
    }
    
    public fun get_entries_count(tournament: &Tournament): u64 {
        vector::length(&tournament.entries)
    }
    
    public fun get_entry_at(tournament: &Tournament, index: u64): (ID, address, String, u64) {
        let entry = vector::borrow(&tournament.entries, index);
        (entry.nft_id, entry.submitter, entry.image_url, entry.vote_count)
    }
    
    // Create a new tournament with duration in minutes
    public entry fun create_tournament_minutes(
        name: vector<u8>,
        description: vector<u8>,
        banner_url: vector<u8>,
        duration_minutes: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let tournament = Tournament {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            banner_url: string::utf8(banner_url),
            end_time: clock::timestamp_ms(clock) + (duration_minutes * 60 * 1000),
            entries: vector::empty(),
            voters: vector::empty(),
            prize_pool: balance::zero(),
            ended: false,
        };
        
        let tournament_id = object::id(&tournament);
        
        event::emit(TournamentCreated {
            tournament_id,
            name: tournament.name,
            end_time: tournament.end_time,
        });
        
        transfer::share_object(tournament);
    }
}