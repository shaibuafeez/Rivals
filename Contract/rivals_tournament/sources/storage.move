module rivals_tournament::storage {
    use std::string::String;
    // Using fully qualified names instead of aliases
    use sui::event;
    // Using fully qualified names for transfer
    use sui::coin::Coin;
    use sui::sui::SUI;
    
    // NFT Image Reference struct to link on-chain NFTs with off-chain image storage
    public struct NFTImageReference has key, store {
        id: UID,
        nft_id: ID,
        image_url: String, // URL to the NFT image
        owner: address,
    }
    
    // Events
    public struct NFTImageStoredEvent has copy, drop {
        nft_id: ID,
        image_url: String,
        owner: address,
    }
    
    // Store a reference to an NFT image
    public fun store_nft_image_reference(
        nft_id: ID,
        image_url: String,
        ctx: &mut TxContext
    ): NFTImageReference {
        let owner = tx_context::sender(ctx);
        
        let image_ref = NFTImageReference {
            id: object::new(ctx),
            nft_id,
            image_url,
            owner,
        };
        
        // Emit event
        event::emit(NFTImageStoredEvent {
            nft_id,
            image_url,
            owner,
        });
        
        image_ref
    }
    
    // Create and transfer an NFT image reference
    public entry fun create_and_transfer_nft_image_reference(
        nft_id: ID,
        image_url: String,
        ctx: &mut TxContext
    ) {
        let image_ref = store_nft_image_reference(nft_id, image_url, ctx);
        transfer::transfer(image_ref, tx_context::sender(ctx));
    }
    
    // Get image URL for an NFT
    public fun get_image_url(image_ref: &NFTImageReference): String {
        image_ref.image_url
    }
    
    // Get NFT ID associated with the image
    public fun get_nft_id(image_ref: &NFTImageReference): ID {
        image_ref.nft_id
    }
    
    // Get owner of the NFT image reference
    public fun get_owner(image_ref: &NFTImageReference): address {
        image_ref.owner
    }
    
    // Check if an image URL is valid (simplified version)
    public fun is_valid_url(_url: String): bool {
        // This is a placeholder. In a real implementation, you would
        // validate the URL format
        true
    }
    
    // Transfer SUI coins to a recipient
    public fun transfer_sui(coin: Coin<SUI>, recipient: address) {
        sui::transfer::public_transfer(coin, recipient);
    }
}
