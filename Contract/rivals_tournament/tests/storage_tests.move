#[test_only]
#[allow(duplicate_alias)]
module rivals_tournament::storage_tests {
    use sui::test_scenario;
    use sui::object;
    use sui::transfer;
    
    use std::string;
    
    use rivals_tournament::storage::{Self, NFTImageReference};
    use rivals_tournament::nft_manager::{Self, RivalNFT};
    
    // Test addresses
    const ADMIN: address = @0xA11CE;
    const USER1: address = @0xB0B;
    
    // Helper function to set up test scenario
    fun setup_test(): test_scenario::Scenario {
        // Start with a clean scenario
        test_scenario::begin(ADMIN)
    }
    
    // Test storing NFT image reference
    #[test]
    fun test_store_nft_image_reference() {
        let mut scenario = setup_test();
        
        // Initialize NFT manager first
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            rivals_tournament::nft_manager::create_display_for_testing(test_scenario::ctx(&mut scenario));
        };
        
        // Mint NFT
        let nft_id: object::ID;
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let nft = nft_manager::mint(
                string::utf8(b"Doonies #337"),
                string::utf8(b"A rare Doonie NFT"),
                b"https://example.com/nft1.png", // Original image URL
                test_scenario::ctx(&mut scenario)
            );
            
            nft_id = object::id(&nft);
            nft_manager::transfer_nft(nft, USER1);
        };
        
        // Store NFT image reference
        test_scenario::next_tx(&mut scenario, USER1);
        {
            // Take the NFT from the sender
            let nft = test_scenario::take_from_sender<RivalNFT>(&scenario);
            
            // Create NFT image reference with a URL string
            let image_ref = storage::store_nft_image_reference(
                nft_id,
                string::utf8(b"https://example.com/nft1.png"),
                test_scenario::ctx(&mut scenario)
            );
            
            // Transfer the image reference to the user (using public_transfer since it has 'store')
            transfer::public_transfer(image_ref, USER1);
            
            // Return objects
            test_scenario::return_to_sender(&scenario, nft);
        };
        
        // Verify NFT image reference was created correctly
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let image_ref = test_scenario::take_from_sender<NFTImageReference>(&scenario);
            
            // Verify the reference properties
            assert!(storage::get_nft_id(&image_ref) == nft_id, 0);
            assert!(storage::get_image_url(&image_ref) == string::utf8(b"https://example.com/nft1.png"), 0);
            assert!(storage::get_owner(&image_ref) == USER1, 0);
            
            // Return the image reference
            test_scenario::return_to_sender(&scenario, image_ref);
        };
        
        test_scenario::end(scenario);
    }
    
    // Test creating and transferring an NFT image reference using the entry function
    #[test]
    fun test_create_and_transfer_nft_image_reference() {
        let mut scenario = setup_test();
        
        // Initialize NFT manager first
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            rivals_tournament::nft_manager::create_display_for_testing(test_scenario::ctx(&mut scenario));
        };
        
        // Mint NFT
        let nft_id: object::ID;
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let nft = nft_manager::mint(
                string::utf8(b"Doonies #337"),
                string::utf8(b"A rare Doonie NFT"),
                b"https://example.com/nft1.png", // Original image URL
                test_scenario::ctx(&mut scenario)
            );
            
            nft_id = object::id(&nft);
            nft_manager::transfer_nft(nft, USER1);
        };
        
        // Create and transfer NFT image reference using the entry function
        test_scenario::next_tx(&mut scenario, USER1);
        {
            storage::create_and_transfer_nft_image_reference(
                nft_id,
                string::utf8(b"https://example.com/nft1.png"),
                test_scenario::ctx(&mut scenario)
            );
        };
        
        // Verify NFT image reference was created correctly
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let image_ref = test_scenario::take_from_sender<NFTImageReference>(&scenario);
            
            // Verify the reference properties
            assert!(storage::get_nft_id(&image_ref) == nft_id, 0);
            assert!(storage::get_image_url(&image_ref) == string::utf8(b"https://example.com/nft1.png"), 0);
            assert!(storage::get_owner(&image_ref) == USER1, 0);
            
            // Return the image reference
            test_scenario::return_to_sender(&scenario, image_ref);
        };
        
        test_scenario::end(scenario);
    }
}
