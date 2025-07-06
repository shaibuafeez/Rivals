const { SuiClient } = require('@mysten/sui/client');

async function checkTournamentVotes() {
  const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io' });
  
  // Tournament ID from the URL in your screenshot
  const tournamentId = '0x7041e16041f01216eb404b9ccb0dc4c84be956081f3df36ef86ec80a325c9880';
  
  try {
    // Fetch the tournament object with all details
    const obj = await client.getObject({
      id: tournamentId,
      options: { 
        showContent: true,
        showType: true,
        showOwner: true
      }
    });
    
    console.log('Tournament Object:', JSON.stringify(obj, null, 2));
    
    if (obj.data?.content?.fields) {
      const fields = obj.data.content.fields;
      console.log('\nTournament Fields:');
      console.log('- Name:', fields.name);
      console.log('- Ended:', fields.ended);
      console.log('- Voters:', fields.voters);
      console.log('- Entries:', fields.entries);
      
      if (fields.entries && Array.isArray(fields.entries)) {
        console.log('\nEntry Details:');
        fields.entries.forEach((entry, index) => {
          console.log(`\nEntry ${index + 1}:`);
          console.log('- Raw entry:', JSON.stringify(entry, null, 2));
          
          // Check different possible structures
          const entryData = entry.fields || entry;
          console.log('- NFT ID:', entryData.nft_id);
          console.log('- Vote Count:', entryData.vote_count);
          console.log('- Submitter:', entryData.submitter);
        });
      }
    }
  } catch (error) {
    console.error('Error fetching tournament:', error);
  }
}

checkTournamentVotes();