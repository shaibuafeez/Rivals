module rival_contract::admin {
    use sui::tx_context::{Self, TxContext};
    use sui::coin;
    use sui::transfer;
    
    use rival_contract::types::{Self, AdminCap, Treasury};
    use sui::balance;
    
    // Error codes
    const ENotAdmin: u64 = 0;
    
    /// Initialize function that's called when the contract is published
    fun init(ctx: &mut TxContext) {
        // Create admin capability and transfer to deployer
        let admin_cap = types::new_admin_cap(ctx);
        
        // Create treasury
        let treasury = types::new_treasury(ctx);
        
        // Transfer admin capability to deployer
        types::transfer_admin_cap(admin_cap, tx_context::sender(ctx));
        
        // Share treasury as a shared object
        types::share_treasury(treasury);
    }
    
    /// Transfer admin capability to a new address
    public entry fun transfer_admin_cap(
        admin_cap: AdminCap,
        new_admin: address
    ) {
        types::transfer_admin_cap(admin_cap, new_admin);
    }
    
    /// Withdraw funds from treasury (admin only)
    public entry fun withdraw_from_treasury(
        _admin_cap: &AdminCap,
        treasury: &mut Treasury,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        // Extract funds from treasury
        let treasury_balance = types::treasury_balance_mut(treasury);
        let withdrawn = balance::split(treasury_balance, amount);
        
        // Transfer to recipient
        let coin = coin::from_balance(withdrawn, ctx);
        transfer::public_transfer(coin, recipient);
    }
}
