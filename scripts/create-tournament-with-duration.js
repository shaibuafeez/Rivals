const { SuiClient } = require('@mysten/sui/client');
const { Transaction } = require('@mysten/sui/transactions');
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');

// Duration options
const DURATIONS = {
  '5min': 5,
  '10min': 10,
  '20min': 20,
  '1hour': 60,
  '24hours': 1440
};

async function createTournamentWithDuration(durationKey = '5min') {
  // Initialize client
  const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io' });
  
  // Package ID for simple tournaments (NEW DEPLOYED CONTRACT)
  const PACKAGE_ID = '0xa8da138454ae256fa6b7904bad7b02d0b6c09474a022332d2d2b4c799d6573d6';
  
  // Create keypair from private key (from .env.local)
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('Please set PRIVATE_KEY environment variable');
    console.log('Example: PRIVATE_KEY=suiprivkey1... node scripts/create-tournament-with-duration.js 5min');
    process.exit(1);
  }
  
  const keypair = Ed25519Keypair.fromSecretKey(privateKey);
  const address = keypair.getPublicKey().toSuiAddress();
  
  console.log('Creating tournament from address:', address);
  
  // Get duration in minutes
  const durationMinutes = DURATIONS[durationKey] || DURATIONS['5min'];
  const durationDisplay = durationKey === '1hour' ? '1 hour' : 
                         durationKey === '24hours' ? '24 hours' : 
                         `${durationMinutes} minutes`;
  
  // Create transaction
  const tx = new Transaction();
  
  // Use the new create_tournament_minutes function for minute-based durations
  const functionName = durationMinutes < 60 ? 'create_tournament_minutes' : 'create_tournament';
  const durationValue = durationMinutes < 60 ? durationMinutes : Math.floor(durationMinutes / 60);
  
  // Create tournament with selected duration
  tx.moveCall({
    target: `${PACKAGE_ID}::simple_tournament::${functionName}`,
    arguments: [
      tx.pure.string(`Quick Tournament (${durationDisplay})`),
      tx.pure.string(`A ${durationDisplay} tournament to test voting functionality`),
      tx.pure.string('https://example.com/banner.jpg'),
      tx.pure.u64(durationValue),
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
        console.log('Duration:', durationDisplay);
        console.log(`\nView it at: http://localhost:3000/tournaments/${created.objectId}`);
      }
    }
  } catch (error) {
    console.error('Error creating tournament:', error);
  }
}

// Get duration from command line argument
const args = process.argv.slice(2);
const duration = args[0] || '5min';

if (!DURATIONS[duration]) {
  console.log('Invalid duration. Available options:');
  console.log('- 5min');
  console.log('- 10min'); 
  console.log('- 20min');
  console.log('- 1hour');
  console.log('- 24hours');
  process.exit(1);
}

// Run the script
createTournamentWithDuration(duration);