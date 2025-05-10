module rivals_tournament::tournament_entry {
    use std::string;
    use sui::coin::Coin;
    use sui::sui::SUI;
    use sui::clock::Clock;
    use sui::tx_context::TxContext;
    use sui::object;
    
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
        ctx: &mut TxContext
    ) {
        tournament::create_tournament(
            registry,
            string::utf8(name),
            string::utf8(description),
            tournament_type,
            duration_hours,
            entry_fee,
            initial_prize,
            clock,
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
        walrus_blob_id: address,
        blob_hash: vector<u8>,
        entry_fee_payment: &mut Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        tournament::register_nft_with_image(
            tournament,
            object::id_from_address(nft_id),
            object::id_from_address(walrus_blob_id),
            blob_hash,
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
        registry: &mut TournamentRegistry,
        tournament: &mut Tournament,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        tournament::end_tournament(
            registry,
            tournament,
            clock,
            ctx
        );
    }
}
