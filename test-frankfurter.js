import fetch from 'node-fetch';

const BASE_URL = 'https://api.frankfurter.app';

async function testTicker() {
    try {
        // Fetch latest rates with EUR base
        const latestResponse = await fetch(`${BASE_URL}/latest?base=EUR`);
        const latestData = await latestResponse.json();
        console.log('Latest Data:', latestData);
        
        const latestDate = new Date(latestData.date);
        console.log('Latest Date:', latestDate);
        
        const yesterdayDate = new Date(latestDate);
        yesterdayDate.setDate(latestDate.getDate() - 1);
        const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
        console.log('Yesterday Str:', yesterdayStr);
        
        const yesterdayResponse = await fetch(`${BASE_URL}/${yesterdayStr}?base=EUR`);
        console.log('Yesterday Response OK:', yesterdayResponse.ok);
        const yesterdayData = await yesterdayResponse.json();
        console.log('Yesterday Data:', yesterdayData);
        
    } catch (err) {
        console.error('Error:', err);
    }
}

testTicker();
