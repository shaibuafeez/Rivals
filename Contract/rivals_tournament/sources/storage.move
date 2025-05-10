module rivals_tournament::storage {
    use std::string::String;
    use sui::object::{Self, ID, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::transfer;
    
    // Import Walrus modules
    use walrus::blob::{Self, Blob};
    
    // Error codes
    const ENotOwner: u64 = 1;
    
    // NFT Image Reference struct to link on-chain NFTs with off-chain Walrus storage
    public struct NFTImageReference has key, store {
        id: UID,
        nft_id: ID,
        walrus_blob_id: ID, // This is the Sui object ID of the Walrus Blob object
        blob_hash: vector<u8>, // The actual blob hash (u256 represented as bytes)
        owner: address,
    }
    
    // Events
    public struct NFTImageStoredEvent has copy, drop {
        nft_id: ID,
        walrus_blob_id: ID,
        blob_hash: vector<u8>,
        owner: address,
    }
    
    // Store a reference to an NFT image stored on Walrus
    public fun store_nft_image_reference(
        nft_id: ID,
        walrus_blob_id: ID,
        blob_hash: vector<u8>,
        ctx: &mut TxContext
    ): NFTImageReference {
        let owner = tx_context::sender(ctx);
        
        let image_ref = NFTImageReference {
            id: object::new(ctx),
            nft_id,
            walrus_blob_id,
            blob_hash,
            owner,
        };
        
        // Emit event
        event::emit(NFTImageStoredEvent {
            nft_id,
            walrus_blob_id,
            blob_hash,
            owner,
        });
        
        image_ref
    }
    
    // Create and transfer an NFT image reference
    public entry fun create_and_transfer_nft_image_reference(
        nft_id: ID,
        walrus_blob_id: ID,
        blob_hash: vector<u8>,
        ctx: &mut TxContext
    ) {
        let image_ref = store_nft_image_reference(nft_id, walrus_blob_id, blob_hash, ctx);
        transfer::transfer(image_ref, tx_context::sender(ctx));
    }
    
    // Get Walrus blob ID for an NFT image
    public fun get_walrus_blob_id(image_ref: &NFTImageReference): ID {
        image_ref.walrus_blob_id
    }
    
    // Get blob hash for an NFT image
    public fun get_blob_hash(image_ref: &NFTImageReference): vector<u8> {
        image_ref.blob_hash
    }
    
    // Get NFT ID associated with the image
    public fun get_nft_id(image_ref: &NFTImageReference): ID {
        image_ref.nft_id
    }
    
    // Get owner of the NFT image reference
    public fun get_owner(image_ref: &NFTImageReference): address {
        image_ref.owner
    }
    
    // Check if a Walrus blob exists (simplified version)
    // In a real implementation, you would check the Walrus registry
    public fun blob_exists(_blob_id: ID): bool {
        // This is a placeholder. In a real implementation, you would
        // check if the blob exists in the Walrus registry
        true
    }
}
