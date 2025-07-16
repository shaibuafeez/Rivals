const { SuiClient } = require('@mysten/sui/client');
const { Transaction } = require('@mysten/sui/transactions');
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');

async function createSimpleTournament() {
  // Load environment variables
  require('dotenv').config();
  
  // Initialize client
  const client = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL });
  
  // Package ID for simple tournaments
  const PACKAGE_ID = process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID;
  
  // Create keypair from private key (from .env)
  const privateKey = process.env.PRIVATE_KEY;
  const keypair = Ed25519Keypair.fromSecretKey(privateKey);
  const address = keypair.getPublicKey().toSuiAddress();
  
  console.log('Creating tournament from address:', address);
  
  // Create transaction
  const tx = new Transaction();
  
  // Create a test tournament
  tx.moveCall({
    target: `${PACKAGE_ID}::simple_tournament::create_tournament`,
    arguments: [
      tx.pure.string('Test Voting Tournament'),
      tx.pure.string('A tournament to test voting functionality'),
      tx.pure.string('https://example.com/banner.jpg'),
      tx.pure.u64(Date.now() + 24 * 60 * 60 * 1000), // End in 24 hours
    ],
  });
  
  try {
    // Execute transaction
    const result = await client.signAndExecuteTransaction({
      transaction: tx,
      signer: keypair,
      options: {
        showEffects: true,
        showObjectChanges: true,
      }
    });
    
    console.log('Transaction digest:', result.digest);
    console.log('Transaction result:', result);
    
    // Find the created tournament ID
    if (result.objectChanges) {
      const created = result.objectChanges.find(change => 
        change.type === 'created' && 
        change.objectType.includes('Tournament')
      );
      
      if (created && 'objectId' in created) {
        console.log('\n✅ Tournament created successfully!');
        console.log('Tournament ID:', created.objectId);
        console.log(`\nView it at: http://localhost:3000/tournaments/${created.objectId}`);
      }
    }
  } catch (error) {
    console.error('Error creating tournament:', error);
  }
}

// Run the script
createSimpleTournament();