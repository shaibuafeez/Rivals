module rival_contract::rewards {
    use sui::object::{Self, ID};
    use sui::tx_context::TxContext;
    use sui::event;
    use sui::coin::{Self};
    use sui::sui::SUI;
    use sui::balance;
    use sui::transfer;

    use rival_contract::types::{Self, AdminCap, Treasury, RegisteredNFT, Tournament};

    // ======== Events ========
    public struct RewardDistributed has copy, drop {
        tournament_id: ID,
        winner_id: ID,
        winner_address: address,
        reward_amount: u64,
        platform_fee: u64
    }

    // ======== Error codes ========
    const ETournamentNotEnded: u64 = 300;
    const ENoWinner: u64 = 301;
    const EInsufficientFunds: u64 = 302;

    // ======== Functions ========

    /// Distribute rewards for a completed tournament
    public fun distribute_rewards(
        _: &AdminCap,
        tournament: &mut Tournament,
        treasury: &mut Treasury,
        winner_nft: &mut RegisteredNFT,
        ctx: &mut TxContext
    ) {
        // Verify tournament is ended
        assert!(types::tournament_is_ended(tournament), ETournamentNotEnded);
        
        // Get tournament prize pool
        let prize_pool = types::tournament_prize_pool_mut(tournament);
        let total_amount = balance::value(prize_pool);
        
        // Calculate reward amounts
        let winner_percentage = types::winner_reward_percentage();
        let platform_percentage = types::platform_fee_percentage();
        
        let winner_amount = (total_amount * winner_percentage) / 100;
        let platform_amount = (total_amount * platform_percentage) / 100;
        
        // Ensure we have enough funds
        assert!(winner_amount + platform_amount <= total_amount, EInsufficientFunds);
        
        // Create coins from prize pool
        let winner_reward = coin::from_balance(balance::split(prize_pool, winner_amount), ctx);
        let platform_fee = coin::from_balance(balance::split(prize_pool, platform_amount), ctx);
        
        // Add platform fee to treasury
        types::add_to_treasury(treasury, platform_fee);
        
        // Update winner stats
        types::increase_nft_tournament_wins(winner_nft);
        
        // Send reward to winner
        let winner_address = types::nft_owner(winner_nft);
        transfer::public_transfer(winner_reward, winner_address);
        
        // Emit event
        let tournament_id = object::uid_to_inner(types::tournament_id(tournament));
        let winner_id = object::uid_to_inner(types::nft_id(winner_nft));
        
        event::emit(RewardDistributed {
            tournament_id,
            winner_id,
            winner_address,
            reward_amount: winner_amount,
            platform_fee: platform_amount
        });
    }

    /// Determine the winner of a tournament based on votes and scores
    /// Returns the ID of the winning NFT
    public fun determine_winner(
        tournament: &Tournament
    ): Option<ID> {
        // This is a placeholder implementation
        // In a real implementation, we would iterate through all participants
        // and find the one with the highest score
        
        // For now, just return None to indicate no winner
        option::none()
    }
}
