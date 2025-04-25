module rival_contract::voting {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::transfer;

    use rival_contract::types::{Self, RegisteredNFT, Tournament, UserProfile};

    // ======== Events ========
    public struct VoteCast has copy, drop {
        voter: address,
        nft_id: ID,
        tournament_id: ID,
        vote_type: u8,
        timestamp: u64
    }

    // ======== Error codes ========
    const EVoteInvalidType: u64 = 200;
    const EVoteCooldownActive: u64 = 201;
    const ETournamentNotActive: u64 = 202;
    // Commented out unused constant
    // const ENFTNotInTournament: u64 = 203;

    // ======== Functions ========

    /// Cast a vote for an NFT in a tournament
    public fun vote(
        nft: &mut RegisteredNFT,
        tournament: &mut Tournament,
        user_profile: &mut UserProfile,
        vote_type: u8,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Validate vote type
        assert!(vote_type == types::vote_pass() || vote_type == types::vote_smash(), EVoteInvalidType);
        
        // Check if tournament is active
        assert!(types::tournament_is_started(tournament) && !types::tournament_is_ended(tournament), ETournamentNotActive);
        
        // Check if NFT is in this tournament
        // Note: This would need to be implemented in the types module
        // assert!(types::nft_in_tournament_with_id(nft, object::uid_to_inner(types::tournament_id(tournament))), ENFTNotInTournament);
        
        // Check if user is on cooldown
        let current_time = clock::timestamp_ms(clock);
        let last_vote_time = types::user_last_vote_time(user_profile);
        let cooldown_period = types::user_cooldown_period(user_profile);
        
        assert!(current_time >= last_vote_time + cooldown_period, EVoteCooldownActive);
        
        // Record the vote
        let voter = tx_context::sender(ctx);
        let nft_id = object::uid_to_inner(types::nft_id(nft));
        let tournament_id = object::uid_to_inner(types::tournament_id(tournament));
        
        // Update NFT stats
        types::increase_nft_total_votes(nft);
        if (vote_type == types::vote_smash()) {
            types::increase_nft_total_smashes(nft);
            
            // Add points based on tournament type
            let tournament_type = types::tournament_type(tournament);
            if (tournament_type == types::tournament_daily()) {
                types::increase_nft_score(nft, types::points_daily());
            } else if (tournament_type == types::tournament_weekly()) {
                types::increase_nft_score(nft, types::points_weekly());
            } else if (tournament_type == types::tournament_monthly()) {
                types::increase_nft_score(nft, types::points_monthly());
            };
        };
        
        // Update user profile
        types::set_user_last_vote_time(user_profile, current_time);
        types::increase_user_total_votes(user_profile);
        
        // Emit event
        event::emit(VoteCast {
            voter,
            nft_id,
            tournament_id,
            vote_type,
            timestamp: current_time
        });
    }

    /// Create a new user profile
    public fun create_user_profile(ctx: &mut TxContext): UserProfile {
        let sender = tx_context::sender(ctx);
        let profile = types::new_user_profile(sender, ctx);
        profile
    }

    /// Share a user profile
    public fun share_user_profile(profile: UserProfile) {
        transfer::public_share_object(profile);
    }
}
