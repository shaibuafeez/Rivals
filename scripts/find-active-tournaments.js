const { SuiClient } = require('@mysten/sui/client');

async function findActiveTournaments() {
  const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io' });
  const REGISTRY_ID = '0x60e804c13a74dd28d23892dd6907bd05cb34f468ad885c20a3035a3ecddc17de';
  
  try {
    // Fetch the registry
    const registry = await client.getObject({
      id: REGISTRY_ID,
      options: { 
        showContent: true,
        showType: true
      }
    });
    
    console.log('Registry Object:', JSON.stringify(registry, null, 2));
    
    if (registry.data?.content?.fields?.tournaments) {
      const tournamentIds = registry.data.content.fields.tournaments;
      console.log('\nFound tournaments:', tournamentIds);
      
      // Check first tournament
      if (tournamentIds.length > 0) {
        const firstTournamentId = tournamentIds[0];
        console.log('\nChecking tournament:', firstTournamentId);
        
        const tournament = await client.getObject({
          id: firstTournamentId,
          options: { 
            showContent: true,
            showType: true
          }
        });
        
        console.log('\nTournament details:', JSON.stringify(tournament, null, 2));
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findActiveTournaments();