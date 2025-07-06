const { SuiClient } = require('@mysten/sui/client');

async function checkMainTournament() {
  const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io' });
  
  // One of the active tournaments from registry
  const tournamentId = '0xd63e9815b58b1e0d1f6cea701efa56c559dd32873e4f95bf8c8264e181ebfa91';
  
  try {
    const tournament = await client.getObject({
      id: tournamentId,
      options: { 
        showContent: true,
        showType: true
      }
    });
    
    console.log('Tournament Type:', tournament.data?.type);
    console.log('\nTournament Fields:', JSON.stringify(tournament.data?.content?.fields, null, 2));
    
    // Check if it has entries with votes
    if (tournament.data?.content?.fields?.entries) {
      const entries = tournament.data.content.fields.entries;
      console.log('\nNumber of entries:', entries.length);
      
      if (entries.length > 0) {
        console.log('\nFirst entry structure:', JSON.stringify(entries[0], null, 2));
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkMainTournament();