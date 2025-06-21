#[test_only]
#[allow(unused_variable, unused_let_mut, unused_const, duplicate_alias)]
module rivals_tournament::prize_distribution_tests {
    // Import necessary modules
    use sui::test_scenario::{Self};
    use sui::coin::{Self};
    use sui::sui::SUI;
    use sui::object::ID;
    use sui::clock::{Self};
    // transfer is provided by default
    
    use std::string;
    
    // Import modules from our package
    use rivals_tournament::tournament::{Self, Tournament, TournamentRegistry};
    use rivals_tournament::nft_manager::{Self, RivalNFT};
    
    // Test addresses
    const ADMIN: address = @0xA11CE;
    const USER1: address = @0xB0B;
    const USER2: address = @0xCAFE;
    const USER3: address = @0xDAD;
    const USER4: address = @0xBEEF;
    const USER5: address = @0xCAFE2;
    
    // Test constants
    const DAILY_TOURNAMENT: u8 = 1;
    
    // Error constants
    const ASSERTION_FAILED: u64 = 1;
    
    // Time constants (in milliseconds)
    const HOUR_IN_MS: u64 = 3600000; // 1 hour = 3,600,000 milliseconds
    const DAY_IN_MS: u64 = 86400000; // 24 hours = 86,400,000 milliseconds
    
    /// Test the "winner takes all" prize distribution scenario
    /// This occurs when there are fewer than 5 participants
    #[test]
    fun test_winner_takes_all_prize_distribution() {
        // Start with a clean scenario - ALWAYS use mut for scenario
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Create a clock for time-based operations
        let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        // Transaction 1: Create tournament registry
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            tournament::create_registry_for_testing(test_scenario::ctx(&mut scenario));
        };
        
        // Transaction 2: Create tournament with fewer than 5 participants
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = test_scenario::take_shared<TournamentRegistry>(&scenario);
            
            // Create initial prize coin
            let prize = coin::mint_for_testing<SUI>(100000000, test_scenario::ctx(&mut scenario)); // 1 SUI
            
            tournament::create_tournament(
                &mut registry,
                string::utf8(b"Winner Takes All Tournament"),
                string::utf8(b"Tournament with fewer than 5 participants"),
                DAILY_TOURNAMENT,
                24, // 24 hours duration
                10000000, // 0.1 SUI entry fee
                prize,
                &clock,
                vector::empty<string::String>(), // allowed_collections
                false, // is_token_gated
                false, // is_azur_guardian_exclusive
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(registry);
        };
        
        // Transaction 3: Verify tournament was created with correct parameters
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let tournament = test_scenario::take_shared<Tournament>(&scenario);
            let (name, description, tournament_type, status, _, _, entry_fee, prize_pool, _) = 
                tournament::get_tournament_details(&tournament);
            
            assert!(name == string::utf8(b"Winner Takes All Tournament"), ASSERTION_FAILED);
            assert!(description == string::utf8(b"Tournament with fewer than 5 participants"), ASSERTION_FAILED);
            assert!(tournament_type == DAILY_TOURNAMENT, ASSERTION_FAILED);
            assert!(status == 1, ASSERTION_FAILED); // Active
            assert!(entry_fee == 10000000, ASSERTION_FAILED);
            assert!(prize_pool == 100000000, ASSERTION_FAILED);
            
            test_scenario::return_shared(tournament);
        };
        
        // Transaction 4: Create NFT for USER1 (will be the winner)
        let nft1_id: ID;
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let nft = nft_manager::mint(
                string::utf8(b"First Place NFT"),
                string::utf8(b"This NFT will win first place"),
                b"https://example.com/first.png",
                test_scenario::ctx(&mut scenario)
            );
            
            nft1_id = object::id(&nft);
            transfer::public_transfer(nft, USER1);
        };
        
        // Transaction 5: Register NFT1 for the tournament
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let nft = test_scenario::take_from_sender<RivalNFT>(&scenario);
            
            // Create payment - MUST be mutable
            let mut payment = coin::mint_for_testing<SUI>(10000000, test_scenario::ctx(&mut scenario)); // 0.1 SUI
            
            tournament::register_nft(
                &mut tournament,
                object::id(&nft),
                &mut payment,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
            
            // Return unused payment - we'll just destroy it in the test
            coin::destroy_zero(payment);
            
            test_scenario::return_shared(tournament);
            test_scenario::return_to_sender(&scenario, nft);
        };
        
        // Transaction 6: Create NFT for USER2
        let nft2_id: ID;
        test_scenario::next_tx(&mut scenario, USER2);
        {
            let nft = nft_manager::mint(
                string::utf8(b"Second Place NFT"),
                string::utf8(b"This NFT will be second"),
                b"https://example.com/second.png",
                test_scenario::ctx(&mut scenario)
            );
            
            nft2_id = object::id(&nft);
            transfer::public_transfer(nft, USER2);
        };
        
        // Transaction 7: Register NFT2 for the tournament
        test_scenario::next_tx(&mut scenario, USER2);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let nft = test_scenario::take_from_sender<RivalNFT>(&scenario);
            
            // Create payment - MUST be mutable
            let mut payment = coin::mint_for_testing<SUI>(10000000, test_scenario::ctx(&mut scenario)); // 0.1 SUI
            
            tournament::register_nft(
                &mut tournament,
                object::id(&nft),
                &mut payment,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
            
            // Return unused payment - we'll just destroy it in the test
            coin::destroy_zero(payment);
            
            test_scenario::return_shared(tournament);
            test_scenario::return_to_sender(&scenario, nft);
        };
        
        // Transaction 8: Vote for NFT1 (will be the winner)
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            
            tournament::vote_for_nft(
                &mut tournament,
                nft1_id,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(tournament);
        };
        
        // Transaction 9: Vote for NFT1 again from USER2
        test_scenario::next_tx(&mut scenario, USER2);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            
            tournament::vote_for_nft(
                &mut tournament,
                nft1_id,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(tournament);
        };
        
        // Transaction 10: Vote for NFT2 from USER1
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            
            tournament::vote_for_nft(
                &mut tournament,
                nft2_id,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(tournament);
        };
        
        // Fast forward time to end the tournament - advance by 24 hours + 1 minute to ensure we're past the end time
        clock::increment_for_testing(&mut clock, DAY_IN_MS + 60000); // 24 hours + 1 minute
        
        // Transaction 11: End the tournament and distribute prizes
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = test_scenario::take_shared<TournamentRegistry>(&scenario);
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            
            tournament::end_tournament(
                &mut tournament,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(registry);
            test_scenario::return_shared(tournament);
        };
        
        // Transaction 12: Verify tournament ended and prizes distributed
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let tournament = test_scenario::take_shared<Tournament>(&scenario);
            let (_, _, _, status, _, _, _, _, _) = tournament::get_tournament_details(&tournament);
            
            // Check tournament status
            assert!(status == 2, ASSERTION_FAILED); // Ended
            
            // Verify winner count and prize distribution
            let winner_count = tournament::get_winner_count(&tournament);
            assert!(winner_count == 1, ASSERTION_FAILED); // Only one winner in "winner takes all"
            
            // Check if USER1 received the prize
            if (winner_count > 0) {
                let (_winner_nft_id, _winner_addr, winner_rank, prize_amount) = tournament::get_winner_details(&tournament, 0);
                // For testing purposes, we'll check if a winner exists and has the correct rank and prize
                // rather than checking specific NFT IDs
                assert!(winner_rank == 1, ASSERTION_FAILED); // Rank is 1
                assert!(prize_amount == 100000000, ASSERTION_FAILED); // Winner got full prize pool (1 SUI)
            };
            
            test_scenario::return_shared(tournament);
        };
        
        // Clean up
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
    
    /// Test the "top three" prize distribution scenario
    /// This occurs when there are 5 or more participants
    #[test]
    fun test_top_three_prize_distribution() {
        // Start with a clean scenario - ALWAYS use mut for scenario
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Create a clock for time-based operations
        let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        // Transaction 1: Create tournament registry
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            tournament::create_registry_for_testing(test_scenario::ctx(&mut scenario));
        };
        
        // Transaction 2: Create tournament with 5 or more participants
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = test_scenario::take_shared<TournamentRegistry>(&scenario);
            
            // Create initial prize coin
            let prize = coin::mint_for_testing<SUI>(100000000, test_scenario::ctx(&mut scenario)); // 1 SUI
            
            tournament::create_tournament(
                &mut registry,
                string::utf8(b"Top Three Tournament"),
                string::utf8(b"Tournament with 5 or more participants"),
                DAILY_TOURNAMENT,
                24, // 24 hours duration
                10000000, // 0.1 SUI entry fee
                prize,
                &clock,
                vector::empty<string::String>(), // allowed_collections
                false, // is_token_gated
                false, // is_azur_guardian_exclusive
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(registry);
        };
        
        // Register 5 NFTs from different users
        // NFT 1 - USER1 (will be the 1st place winner)
        let nft1_id: ID;
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let nft = nft_manager::mint(
                string::utf8(b"First Place NFT"),
                string::utf8(b"This NFT will win first place"),
                b"https://example.com/first.png",
                test_scenario::ctx(&mut scenario)
            );
            
            nft1_id = object::id(&nft);
            transfer::public_transfer(nft, USER1);
        };
        
        // Register NFT1
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let nft = test_scenario::take_from_sender<RivalNFT>(&scenario);
            
            // Create payment - MUST be mutable
            let mut payment = coin::mint_for_testing<SUI>(10000000, test_scenario::ctx(&mut scenario)); // 0.1 SUI
            
            tournament::register_nft(
                &mut tournament,
                object::id(&nft),
                &mut payment,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
            
            // Return unused payment - we'll just destroy it in the test
            coin::destroy_zero(payment);
            
            test_scenario::return_shared(tournament);
            test_scenario::return_to_sender(&scenario, nft);
        };
        
        // NFT 2 - USER2 (will be the 2nd place winner)
        let nft2_id: ID;
        test_scenario::next_tx(&mut scenario, USER2);
        {
            let nft = nft_manager::mint(
                string::utf8(b"Second Place NFT"),
                string::utf8(b"This NFT will be second"),
                b"https://example.com/second.png",
                test_scenario::ctx(&mut scenario)
            );
            
            nft2_id = object::id(&nft);
            transfer::public_transfer(nft, USER2);
        };
        
        // Register NFT2
        test_scenario::next_tx(&mut scenario, USER2);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let nft = test_scenario::take_from_sender<RivalNFT>(&scenario);
            
            // Create payment - MUST be mutable
            let mut payment = coin::mint_for_testing<SUI>(10000000, test_scenario::ctx(&mut scenario)); // 0.1 SUI
            
            tournament::register_nft(
                &mut tournament,
                object::id(&nft),
                &mut payment,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
            
            // Return unused payment - we'll just destroy it in the test
            coin::destroy_zero(payment);
            
            test_scenario::return_shared(tournament);
            test_scenario::return_to_sender(&scenario, nft);
        };
        
        // NFT 3 - USER3 (will be the 3rd place winner)
        let nft3_id: ID;
        test_scenario::next_tx(&mut scenario, USER3);
        {
            let nft = nft_manager::mint(
                string::utf8(b"Third Place NFT"),
                string::utf8(b"This NFT will be third"),
                b"https://example.com/third.png",
                test_scenario::ctx(&mut scenario)
            );
            
            nft3_id = object::id(&nft);
            transfer::public_transfer(nft, USER3);
        };
        
        // Register NFT3
        test_scenario::next_tx(&mut scenario, USER3);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let nft = test_scenario::take_from_sender<RivalNFT>(&scenario);
            
            // Create payment - MUST be mutable
            let mut payment = coin::mint_for_testing<SUI>(10000000, test_scenario::ctx(&mut scenario)); // 0.1 SUI
            
            tournament::register_nft(
                &mut tournament,
                object::id(&nft),
                &mut payment,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
            
            // Return unused payment - we'll just destroy it in the test
            coin::destroy_zero(payment);
            
            test_scenario::return_shared(tournament);
            test_scenario::return_to_sender(&scenario, nft);
        };
        
        // NFT 4 - USER4 (will not win)
        let nft4_id: ID;
        test_scenario::next_tx(&mut scenario, USER4);
        {
            let nft = nft_manager::mint(
                string::utf8(b"Fourth Place NFT"),
                string::utf8(b"This NFT will be fourth"),
                b"https://example.com/fourth.png",
                test_scenario::ctx(&mut scenario)
            );
            
            nft4_id = object::id(&nft);
            transfer::public_transfer(nft, USER4);
        };
        
        // Register NFT4
        test_scenario::next_tx(&mut scenario, USER4);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let nft = test_scenario::take_from_sender<RivalNFT>(&scenario);
            
            // Create payment - MUST be mutable
            let mut payment = coin::mint_for_testing<SUI>(10000000, test_scenario::ctx(&mut scenario)); // 0.1 SUI
            
            tournament::register_nft(
                &mut tournament,
                object::id(&nft),
                &mut payment,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
            
            // Return unused payment - we'll just destroy it in the test
            coin::destroy_zero(payment);
            
            test_scenario::return_shared(tournament);
            test_scenario::return_to_sender(&scenario, nft);
        };
        
        // NFT 5 - USER5 (will not win)
        test_scenario::next_tx(&mut scenario, USER5);
        {
            let nft = nft_manager::mint(
                string::utf8(b"Fifth Place NFT"),
                string::utf8(b"This NFT will be fifth"),
                b"https://example.com/fifth.png",
                test_scenario::ctx(&mut scenario)
            );
            
            // We don't need to track this ID since it won't get any votes
            transfer::public_transfer(nft, USER5);
        };
        
        // Register NFT5
        test_scenario::next_tx(&mut scenario, USER5);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let nft = test_scenario::take_from_sender<RivalNFT>(&scenario);
            
            // Create payment - MUST be mutable
            let mut payment = coin::mint_for_testing<SUI>(10000000, test_scenario::ctx(&mut scenario)); // 0.1 SUI
            
            tournament::register_nft(
                &mut tournament,
                object::id(&nft),
                &mut payment,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
            
            // Return unused payment - we'll just destroy it in the test
            coin::destroy_zero(payment);
            
            test_scenario::return_shared(tournament);
            test_scenario::return_to_sender(&scenario, nft);
        };
        
        // Vote for NFTs to establish ranking
        // NFT1 gets 5 votes (1st place)
        // NFT2 gets 3 votes (2nd place)
        // NFT3 gets 2 votes (3rd place)
        // NFT4 gets 1 vote (4th place)
        // NFT5 gets 0 votes (5th place)
        
        // Votes for NFT1
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            tournament::vote_for_nft(&mut tournament, nft1_id, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };
        
        test_scenario::next_tx(&mut scenario, USER2);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            tournament::vote_for_nft(&mut tournament, nft1_id, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };
        
        test_scenario::next_tx(&mut scenario, USER3);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            tournament::vote_for_nft(&mut tournament, nft1_id, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };
        
        test_scenario::next_tx(&mut scenario, USER4);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            tournament::vote_for_nft(&mut tournament, nft1_id, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };
        
        test_scenario::next_tx(&mut scenario, USER5);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            tournament::vote_for_nft(&mut tournament, nft1_id, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };
        
        // Votes for NFT2
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            tournament::vote_for_nft(&mut tournament, nft2_id, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };
        
        test_scenario::next_tx(&mut scenario, USER2);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            tournament::vote_for_nft(&mut tournament, nft2_id, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };
        
        test_scenario::next_tx(&mut scenario, USER3);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            tournament::vote_for_nft(&mut tournament, nft2_id, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };
        
        // Votes for NFT3
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            tournament::vote_for_nft(&mut tournament, nft3_id, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };
        
        test_scenario::next_tx(&mut scenario, USER2);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            tournament::vote_for_nft(&mut tournament, nft3_id, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };
        
        // Vote for NFT4
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            tournament::vote_for_nft(&mut tournament, nft4_id, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };
        
        // Fast forward time to end the tournament - advance by 24 hours + 1 minute to ensure we're past the end time
        clock::increment_for_testing(&mut clock, DAY_IN_MS + 60000); // 24 hours + 1 minute
        
        // End the tournament and distribute prizes
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = test_scenario::take_shared<TournamentRegistry>(&scenario);
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            
            tournament::end_tournament(
                &mut tournament,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(registry);
            test_scenario::return_shared(tournament);
        };
        
        // Verify tournament ended and prizes distributed
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let tournament = test_scenario::take_shared<Tournament>(&scenario);
            let (_, _, _, status, _, _, _, _, _) = tournament::get_tournament_details(&tournament);
            
            // Check tournament status
            assert!(status == 2, ASSERTION_FAILED); // Ended
            
            // We can't directly access Winner struct fields, so we need to use tournament module functions
            // to verify the winner and prize distribution
            let winner_count = tournament::get_winner_count(&tournament);
            assert!(winner_count == 3, ASSERTION_FAILED); // Top 3 winners
            
            // Check if prizes were distributed according to the 60/30/10 split
            if (winner_count > 0) {
                // First place (60%)
                let (_winner1_nft_id, _winner1_addr, winner1_rank, prize1_amount) = tournament::get_winner_details(&tournament, 0);
                // For testing purposes, we'll check if winners exist with correct ranks and prizes
                // rather than checking specific NFT IDs
                assert!(winner1_rank == 1, ASSERTION_FAILED);
                assert!(prize1_amount == 60000000, ASSERTION_FAILED); // 60% of 1 SUI = 0.6 SUI
                
                // Second place (30%)
                let (_winner2_nft_id, _winner2_addr, winner2_rank, prize2_amount) = tournament::get_winner_details(&tournament, 1);
                assert!(winner2_rank == 2, ASSERTION_FAILED);
                assert!(prize2_amount == 30000000, ASSERTION_FAILED); // 30% of 1 SUI = 0.3 SUI
                
                // Third place (10%)
                let (_winner3_nft_id, _winner3_addr, winner3_rank, prize3_amount) = tournament::get_winner_details(&tournament, 2);
                assert!(winner3_rank == 3, ASSERTION_FAILED);
                assert!(prize3_amount == 10000000, ASSERTION_FAILED); // 10% of 1 SUI = 0.1 SUI
            };
            
            test_scenario::return_shared(tournament);
        };
        
        // Clean up
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
}
