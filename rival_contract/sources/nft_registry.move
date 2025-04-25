module rival_contract::nft_registry {
    use sui::object::{Self, ID};
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::url::{Self, Url};
    use sui::transfer;
    use sui::event;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    
    use rival_contract::types::{Self, RegisteredNFT};
    
    // Events
    public struct NFTRegistered has copy, drop {
        nft_id: ID,
        owner: address,
        name: String
    }
    
    public struct NFTUnregistered has copy, drop {
        nft_id: ID,
        owner: address
    }
    
    // Register an NFT to participate in tournaments
    // The entry fee (1 SUI minimum) is required
    public entry fun register_nft(
        original_nft_id: address,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        entry_fee: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);
        
        // Verify entry fee is at least 1 SUI
        let entry_fee_value = coin::value(&entry_fee);
        assert!(entry_fee_value >= types::min_entry_fee(), types::e_insufficient_fee());
        
        // Create registered NFT using the constructor function
        let registered_nft = types::new_registered_nft(
            original_nft_id,
            sender,
            string::utf8(name),
            string::utf8(description),
            url::new_unsafe_from_bytes(image_url),
            timestamp,
            ctx
        );
        
        // Emit registration event
        let nft_id = object::id(&registered_nft);
        event::emit(NFTRegistered {
            nft_id,
            owner: sender,
            name: string::utf8(name)
        });
        
        // Transfer NFT to sender
        transfer::public_transfer(registered_nft, sender);
        
        // Handle entry fee - in a real implementation, this would be transferred to the tournament prize pool
        // For now, we'll just transfer it back to the sender
        transfer::public_transfer(entry_fee, sender);
    }
    
    // Unregister an NFT
    public entry fun unregister_nft(
        nft: RegisteredNFT,
        _ctx: &mut TxContext
    ) {
        // Get the information we need before destructing the NFT
        // Use object::id_from_address to convert the ID to an ID type for the event
        let nft_id = object::id(&nft);
        let owner = types::nft_owner(&nft);
        
        // Emit unregistration event before deleting the NFT
        event::emit(NFTUnregistered {
            nft_id,
            owner
        });
        
        // Now delete the NFT object
        types::delete_registered_nft(nft);
    }
    
    // Update NFT metadata (only owner can do this)
    public entry fun update_nft_metadata(
        nft: &mut RegisteredNFT,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(types::nft_owner(nft) == sender, types::e_not_owner()); // Only owner can update
        
        types::set_nft_name(nft, string::utf8(name));
        types::set_nft_description(nft, string::utf8(description));
        types::set_nft_image_url(nft, url::new_unsafe_from_bytes(image_url));
    }
    
    // Get NFT metadata
    public fun get_nft_name(nft: &RegisteredNFT): &String {
        types::nft_name(nft)
    }
    
    public fun get_nft_description(nft: &RegisteredNFT): &String {
        types::nft_description(nft)
    }
    
    public fun get_nft_image_url(nft: &RegisteredNFT): &Url {
        types::nft_image_url(nft)
    }
    
    public fun get_nft_owner(nft: &RegisteredNFT): address {
        types::nft_owner(nft)
    }
    
    public fun get_nft_score(nft: &RegisteredNFT): u64 {
        types::nft_score(nft)
    }
    
    public fun get_nft_tournament_wins(nft: &RegisteredNFT): u64 {
        types::nft_tournament_wins(nft)
    }
    
    public fun get_nft_total_votes(nft: &RegisteredNFT): u64 {
        types::nft_total_votes(nft)
    }
    
    public fun get_nft_total_smashes(nft: &RegisteredNFT): u64 {
        types::nft_total_smashes(nft)
    }
}
