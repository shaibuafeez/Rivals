const { SuiClient } = require('@mysten/sui/client');
require('dotenv').config({ path: '.env.local' });

async function checkRegistryTournaments() {
  const client = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL });
  
  console.log('Checking registry tournaments...\n');
  
  try {
    // Get the registry
    const registry = await client.getObject({
      id: process.env.NEXT_PUBLIC_TOURNAMENT_REGISTRY_ID,
      options: { showContent: true }
    });
    
    if (!registry.data || !registry.data.content || registry.data.content.dataType !== 'moveObject') {
      console.log('Registry not found or invalid');
      return;
    }
    
    const activeTournaments = registry.data.content.fields.active_tournaments;
    console.log('Active tournament IDs in registry:', activeTournaments.length);
    
    // Check each tournament
    for (const tournamentId of activeTournaments) {
      console.log('\nChecking tournament:', tournamentId);
      
      try {
        const tournament = await client.getObject({
          id: tournamentId,
          options: { showContent: true, showType: true }
        });
        
        if (tournament.data && tournament.data.content && tournament.data.content.dataType === 'moveObject') {
          console.log('Type:', tournament.data.type);
          const fields = tournament.data.content.fields;
          console.log('Name:', fields.name);
          console.log('Description:', fields.description?.substring(0, 50) + '...');
          console.log('Status:', fields.status);
          console.log('End Time:', new Date(parseInt(fields.end_time)).toLocaleString());
          
          // Check if it's a simple tournament or regular tournament
          if (tournament.data.type?.includes('simple_tournament')) {
            console.log('-> This is a SIMPLE tournament');
          } else {
            console.log('-> This is a REGULAR tournament');
          }
        }
      } catch (error) {
        console.log('Error fetching tournament:', error.message);
      }
    }
    
    // Also check for simple tournament events directly
    console.log('\n\nChecking for SimpleTournament events...');
    const simpleEvents = await client.queryEvents({
      query: {
        MoveEventType: `${process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID}::simple_tournament::TournamentCreated`
      },
      limit: 10,
      order: 'descending'
    });
    
    console.log('Found', simpleEvents.data.length, 'simple tournament events');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkRegistryTournaments();