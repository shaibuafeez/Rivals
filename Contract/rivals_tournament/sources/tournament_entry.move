module rivals_tournament::tournament_entry {
    use std::string;
    use std::string::String;
    // vector is provided by default
    use sui::coin::Coin;
    use sui::sui::SUI;
    use sui::clock::Clock;
    // TxContext is provided by default
    // object is provided by default
    
    use rivals_tournament::tournament::{Self, Tournament, TournamentRegistry};
    
    /// Create a new tournament (admin only)
    public entry fun create_tournament_entry(
        registry: &mut TournamentRegistry,
        name: vector<u8>,
        description: vector<u8>,
        tournament_type: u8,
        duration_hours: u64,
        entry_fee: u64,
        initial_prize: Coin<SUI>,
        clock: &Clock,
        // New parameters for collection restrictions and token gating
        allowed_collections: vector<vector<u8>>,
        is_token_gated: bool,
        is_azur_guardian_exclusive: bool,
        ctx: &mut TxContext
    ) {
        // Convert vector<u8> to String for name and description
        let name_string = string::utf8(name);
        let description_string = string::utf8(description);
        
        // Convert vector<vector<u8>> to vector<String> for allowed collections
        let mut allowed_collections_strings = vector::empty<String>();
        let mut i = 0;
        let len = vector::length(&allowed_collections);
        
        while (i < len) {
            let collection = vector::borrow(&allowed_collections, i);
            vector::push_back(&mut allowed_collections_strings, string::utf8(*collection));
            i = i + 1;
        };
        
        tournament::create_tournament(
            registry,
            name_string,
            description_string,
            tournament_type,
            duration_hours,
            entry_fee,
            initial_prize,
            clock,
            allowed_collections_strings,
            is_token_gated,
            is_azur_guardian_exclusive,
            ctx
        );
    }
    
    /// Register an NFT to a tournament
    public entry fun register_nft_entry(
        tournament: &mut Tournament,
        nft_id: address,
        entry_fee_payment: &mut Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        tournament::register_nft(
            tournament,
            object::id_from_address(nft_id),
            entry_fee_payment,
            clock,
            ctx
        );
    }
    
    /// Register an NFT with an image stored on Walrus
    public entry fun register_nft_with_image_entry(
        tournament: &mut Tournament,
        nft_id: address,
        image_url_bytes: vector<u8>,
        entry_fee_payment: &mut Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Convert image URL bytes to string
        let image_url = string::utf8(image_url_bytes);
        
        tournament::register_nft_with_image(
            tournament,
            object::id_from_address(nft_id),
            image_url,
            entry_fee_payment,
            clock,
            ctx
        );
    }
    
    /// Vote for an NFT in a tournament
    public entry fun vote_for_nft_entry(
        tournament: &mut Tournament,
        nft_id: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        tournament::vote_for_nft(
            tournament,
            object::id_from_address(nft_id),
            clock,
            ctx
        );
    }
    
    /// End a tournament and distribute prizes (admin only)
    public entry fun end_tournament_entry(
        tournament: &mut Tournament,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        tournament::end_tournament(
            tournament,
            clock,
            ctx
        );
    }
}
