#[test_only]
#[allow(unused_const, unused_let_mut)]
module rivals_tournament::basic_tournament_test {
    // Import necessary modules
    use sui::test_scenario;
    use sui::coin;
    use sui::sui::SUI;
    use sui::clock;
    
    use std::string;
    
    // Import modules from our package
    use rivals_tournament::tournament::{Self, Tournament, TournamentRegistry};
    
    // Test addresses
    const ADMIN: address = @0xA11CE;
    const USER1: address = @0xB0B;
    const USER2: address = @0xCAFE;
    
    // Test constants
    const DAILY_TOURNAMENT: u8 = 1;
    
    // Error constants
    const ASSERTION_FAILED: u64 = 1;
    
    #[test]
    fun test_create_tournament() {
        // Start with a clean scenario
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Create a clock for time-based operations
        let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        // Transaction 1: Create tournament registry
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            tournament::create_registry_for_testing(test_scenario::ctx(&mut scenario));
        };
        
        // Transaction 2: Create tournament
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = test_scenario::take_shared<TournamentRegistry>(&scenario);
            
            // Create initial prize coin
            let prize = coin::mint_for_testing<SUI>(100000000, test_scenario::ctx(&mut scenario)); // 1 SUI
            
            tournament::create_tournament(
                &mut registry,
                string::utf8(b"Test Tournament"),
                string::utf8(b"Tournament for testing"),
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
        
        // Transaction 3: Verify tournament was created
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let tournament = test_scenario::take_shared<Tournament>(&scenario);
            let (name, description, tournament_type, status, _, _, entry_fee, _, _) = 
                tournament::get_tournament_details(&tournament);
            
            // Verify tournament details
            assert!(name == string::utf8(b"Test Tournament"), ASSERTION_FAILED);
            assert!(description == string::utf8(b"Tournament for testing"), ASSERTION_FAILED);
            assert!(tournament_type == DAILY_TOURNAMENT, ASSERTION_FAILED);
            assert!(status == 1, ASSERTION_FAILED); // Active
            assert!(entry_fee == 10000000, ASSERTION_FAILED);
            
            test_scenario::return_shared(tournament);
        };
        
        // Clean up
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
    
    #[test]
    fun test_end_tournament() {
        // Start with a clean scenario
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Create a clock for time-based operations
        let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
        
        // Transaction 1: Create tournament registry
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            tournament::create_registry_for_testing(test_scenario::ctx(&mut scenario));
        };
        
        // Transaction 2: Create tournament
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = test_scenario::take_shared<TournamentRegistry>(&scenario);
            
            // Create initial prize coin
            let prize = coin::mint_for_testing<SUI>(100000000, test_scenario::ctx(&mut scenario)); // 1 SUI
            
            tournament::create_tournament(
                &mut registry,
                string::utf8(b"Test Tournament"),
                string::utf8(b"Tournament for testing"),
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
        
        // Transaction 3: Advance clock past end time
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            // Advance clock by 25 hours (tournament duration + 1 hour)
            clock::increment_for_testing(&mut clock, 25 * 3600000);
        };
        
        // Transaction 4: End tournament
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            
            // Add a dummy participant using our helper function
            let dummy_id = object::new(test_scenario::ctx(&mut scenario));
            let dummy_id_id = object::uid_to_inner(&dummy_id);
            tournament::add_test_participant(&mut tournament, dummy_id_id, ADMIN);
            object::delete(dummy_id);
            
            tournament::end_tournament(
                &mut tournament,
                &clock,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(tournament);
        };
        
        // Transaction 5: Verify tournament ended
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let tournament = test_scenario::take_shared<Tournament>(&scenario);
            let (_, _, _, status, _, _, _, _, _) = tournament::get_tournament_details(&tournament);
            
            // Check tournament status
            assert!(status == 2, ASSERTION_FAILED); // Ended
            
            // Check winner count
            let winner_count = tournament::get_winner_count(&tournament);
            assert!(winner_count == 0, ASSERTION_FAILED); // No winners since we had no real participants
            
            test_scenario::return_shared(tournament);
        };
        
        // Clean up
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
}
