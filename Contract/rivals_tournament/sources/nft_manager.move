module rivals_tournament::nft_manager {
    // Import standard libraries
    use sui::url::{Self, Url};
    use sui::event;
    use sui::package;
    use sui::display;
    
    use std::string::{Self, String};
    
    // Error codes
    const ENotOwner: u64 = 1;
    
    // One-time witness for the package
    public struct NFT_MANAGER has drop {}
    
    // NFT struct that can be used in tournaments
    public struct RivalNFT has key, store {
        id: UID,
        name: String,
        description: String,
        url: Url,
        creator: address,
        tournament_history: vector<ID>,
        total_votes_received: u64,
        tournaments_won: u64,
    }
    
    // Events
    public struct NFTMintedEvent has copy, drop {
        nft_id: ID,
        name: String,
        creator: address,
    }
    
    public struct NFTTournamentResultEvent has copy, drop {
        nft_id: ID,
        tournament_id: ID,
        votes_received: u64,
        won: bool,
    }
    
    // Initialize the display for RivalNFT
    fun init(witness: NFT_MANAGER, ctx: &mut TxContext) {
        let publisher = package::claim(witness, ctx);
        
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
            string::utf8(b"creator"),
            string::utf8(b"tournaments_won"),
        ];
        
        let values = vector[
            string::utf8(b"{name}"),
            string::utf8(b"{description}"),
            string::utf8(b"{url}"),
            string::utf8(b"{creator}"),
            string::utf8(b"{tournaments_won}"),
        ];
        
        let mut display: display::Display<RivalNFT> = display::new_with_fields<RivalNFT>(
            &publisher, keys, values, ctx
        );
        
        display::update_version(&mut display);
        
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
    }
    
    #[test_only]
    /// Create a test publisher for NFT display
    public fun create_display_for_testing(ctx: &mut TxContext) {
        let witness = NFT_MANAGER {};
        let publisher = package::test_claim(witness, ctx);
        
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
            string::utf8(b"creator"),
            string::utf8(b"tournaments_won"),
        ];
        
        let values = vector[
            string::utf8(b"{name}"),
            string::utf8(b"{description}"),
            string::utf8(b"{url}"),
            string::utf8(b"{creator}"),
            string::utf8(b"{tournaments_won}"),
        ];
        
        let mut display = display::new_with_fields<RivalNFT>(
            &publisher, keys, values, ctx
        );
        
        display::update_version(&mut display);
        
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
    }
    
    // Mint a new RivalNFT
    public fun mint(
        name: String,
        description: String,
        url_string: vector<u8>,
        ctx: &mut TxContext
    ): RivalNFT {
        let id = object::new(ctx);
        let nft_id = object::uid_to_inner(&id);
        let creator = tx_context::sender(ctx);
        
        // Emit event
        event::emit(NFTMintedEvent {
            nft_id,
            name: name,
            creator,
        });
        
        RivalNFT {
            id,
            name,
            description,
            url: url::new_unsafe_from_bytes(url_string),
            creator,
            tournament_history: vector::empty(),
            total_votes_received: 0,
            tournaments_won: 0,
        }
    }
    
    // Mint and transfer a new RivalNFT
    public fun mint_and_transfer(
        name: String,
        description: String,
        url_string: vector<u8>,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let nft = mint(name, description, url_string, ctx);
        transfer::public_transfer(nft, recipient);
    }
    
    // Update NFT after tournament participation
    public fun update_after_tournament(
        nft: &mut RivalNFT,
        tournament_id: ID,
        votes_received: u64,
        won: bool,
        ctx: &mut TxContext
    ) {
        // Verify caller is the owner
        assert!(tx_context::sender(ctx) == nft.creator, ENotOwner);
        
        // Add tournament to history
        vector::push_back(&mut nft.tournament_history, tournament_id);
        
        // Update total votes
        nft.total_votes_received = nft.total_votes_received + votes_received;
        
        // Update tournaments won if applicable
        if (won) {
            nft.tournaments_won = nft.tournaments_won + 1;
        };
        
        // Emit event
        event::emit(NFTTournamentResultEvent {
            nft_id: object::id(nft),
            tournament_id,
            votes_received,
            won,
        });
    }
    
    // Get NFT details
    public fun get_nft_details(nft: &RivalNFT): (String, String, address, u64, u64) {
        (
            nft.name,
            nft.description,
            nft.creator,
            nft.total_votes_received,
            nft.tournaments_won
        )
    }
    
    // Get NFT tournament history
    public fun get_tournament_history(nft: &RivalNFT): vector<ID> {
        nft.tournament_history
    }
    
    // Transfer NFT to a new owner
    public fun transfer_nft(nft: RivalNFT, recipient: address) {
        transfer::public_transfer(nft, recipient);
    }
}
