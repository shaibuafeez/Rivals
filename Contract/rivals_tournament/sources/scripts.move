module rivals_tournament::scripts {
    use sui::tx_context::TxContext;
    use sui::coin::Coin;
    use sui::sui::SUI;
    use sui::clock::Clock;
    use std::string;
    
    use rivals_tournament::tournament::{Self, TournamentRegistry};

    // Entry function to create a tournament with a prize from the caller
    public entry fun create_tournament(
        registry: &mut TournamentRegistry,
        name: vector<u8>,
        description: vector<u8>,
        tournament_type: u8,
        duration_hours: u64,
        entry_fee: u64,
        initial_prize: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Convert bytes to strings
        let name_string = string::utf8(name);
        let description_string = string::utf8(description);
        
        // Call the tournament module's create_tournament function
        tournament::create_tournament(
            registry,
            name_string,
            description_string,
            tournament_type,
            duration_hours,
            entry_fee,
            initial_prize,
            clock,
            ctx
        );
    }
}
