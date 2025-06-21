const { SuiClient, getFullnodeUrl } = require('@mysten/sui/client');
require('dotenv').config({ path: '.env.local' });

async function verifyNetwork() {
  console.log('Environment Variables:');
  console.log('NEXT_PUBLIC_NETWORK:', process.env.NEXT_PUBLIC_NETWORK);
  console.log('NEXT_PUBLIC_SUI_RPC_URL:', process.env.NEXT_PUBLIC_SUI_RPC_URL);
  console.log('NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID:', process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID);
  console.log('NEXT_PUBLIC_TOURNAMENT_REGISTRY_ID:', process.env.NEXT_PUBLIC_TOURNAMENT_REGISTRY_ID);
  
  const rpcUrl = process.env.NEXT_PUBLIC_SUI_RPC_URL || getFullnodeUrl('mainnet');
  console.log('\nUsing RPC URL:', rpcUrl);
  
  const client = new SuiClient({ url: rpcUrl });
  
  try {
    // Get chain identifier
    const chainId = await client.getChainIdentifier();
    console.log('\nChain Identifier:', chainId);
    
    // Get latest system state
    const systemState = await client.getLatestSuiSystemState();
    console.log('System State Epoch:', systemState.epoch);
    console.log('Network Version:', systemState.protocolVersion);
    
    // Check if the tournament registry exists
    if (process.env.NEXT_PUBLIC_TOURNAMENT_REGISTRY_ID && process.env.NEXT_PUBLIC_TOURNAMENT_REGISTRY_ID !== '0x0') {
      console.log('\nChecking Tournament Registry...');
      try {
        const registry = await client.getObject({
          id: process.env.NEXT_PUBLIC_TOURNAMENT_REGISTRY_ID,
          options: { showContent: true, showType: true }
        });
        
        if (registry.data) {
          console.log('Registry exists!');
          console.log('Object Type:', registry.data.type);
          if (registry.data.content && registry.data.content.dataType === 'moveObject') {
            const fields = registry.data.content.fields;
            console.log('Registry content:', JSON.stringify(fields, null, 2));
          }
        } else {
          console.log('Registry NOT found!');
        }
      } catch (error) {
        console.log('Error fetching registry:', error.message);
      }
    }
    
    // Try to query for tournament events
    console.log('\nQuerying for Tournament Events...');
    try {
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${process.env.NEXT_PUBLIC_SIMPLE_TOURNAMENT_PACKAGE_ID}::simple_tournament::TournamentCreated`
        },
        limit: 5,
        order: 'descending'
      });
      
      console.log('Found', events.data.length, 'TournamentCreated events');
      
      if (events.data.length > 0) {
        console.log('\nLatest tournaments:');
        for (const event of events.data) {
          if (event.parsedJson) {
            console.log('- Tournament ID:', event.parsedJson.tournament_id);
            console.log('  Name:', event.parsedJson.name);
            console.log('  End Time:', new Date(parseInt(event.parsedJson.end_time)).toLocaleString());
          }
        }
      }
    } catch (error) {
      console.log('Error querying events:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyNetwork();