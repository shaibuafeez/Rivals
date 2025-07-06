const { SuiClient } = require('@mysten/sui/client');
const { Transaction } = require('@mysten/sui/transactions');

async function testVoteOnMainnet() {
  const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io' });
  
  // Main tournament package (not simple tournament)
  const PACKAGE_ID = '0x203bbd21feeaa6ea6ea756e83548de6a54ed6ac6c29e5dbbfdfe026d5b44858d';
  
  // One of the active tournaments
  const tournamentId = '0xd63e9815b58b1e0d1f6cea701efa56c559dd32873e4f95bf8c8264e181ebfa91';
  
  // Create vote transaction using the main tournament contract
  const tx = new Transaction();
  
  // The main tournament contract uses a different vote function
  // We need to check the exact function signature
  console.log('Main tournament package ID:', PACKAGE_ID);
  console.log('Tournament ID:', tournamentId);
  
  // Try to find the vote function in the main contract
  tx.moveCall({
    target: `${PACKAGE_ID}::tournament::vote_for_nft`,
    arguments: [
      tx.object(tournamentId),
      tx.pure.address('0x1234567890abcdef1234567890abcdef12345678'), // Example NFT ID
    ],
  });
  
  console.log('Transaction block:', tx);
}

testVoteOnMainnet();