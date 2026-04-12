// Test participant selection endpoint
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8787';

async function testSelectParticipant() {
  console.log('🧪 Testing participant selection...\n');
  
  try {
    // Step 1: Select a participant
    const selectResponse = await fetch(`${BASE_URL}/api/participations/select`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        memberId: '26',  // User with existing participations
        itemKey: 'test_mission_reward',
        points: 5000
      })
    });
    
    const selectResult = await selectResponse.json();
    console.log('✅ Selection result:', JSON.stringify(selectResult, null, 2));
    
    // Step 2: Check point history
    const historyResponse = await fetch(`${BASE_URL}/api/points/26/history?limit=5`);
    const history = await historyResponse.json();
    console.log('\n📊 Point history (last 5):');
    console.log(JSON.stringify(history, null, 2));
    
    // Step 3: Check balance
    const balanceResponse = await fetch(`${BASE_URL}/api/points/26/balance`);
    const balance = await balanceResponse.json();
    console.log('\n💰 Current balance:', balance);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSelectParticipant();
