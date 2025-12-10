import fs from 'fs';
import https from 'https';

const START_DATE = new Date('2009-01-03');
const END_DATE = new Date();
const OUTPUT_FILE = 'btc-price-history.csv';

async function fetchMarketData(fromTimestamp, toTimestamp) {
  return new Promise((resolve, reject) => {
    const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${fromTimestamp}&to=${toTimestamp}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function convertToEur(usd) { return (usd / 1.1).toFixed(2); }

async function main() {
  console.log('🚀 Fetching Bitcoin historical data...');
  const csvRows = ['timestamp,date,price_usd,price_eur,volume_24h,market_cap'];
  let currentDate = new Date(START_DATE);
  let requestCount = 0;
  
  while (currentDate < END_DATE) {
    const fromTimestamp = Math.floor(currentDate.getTime() / 1000);
    const toDate = new Date(currentDate);
    toDate.setDate(toDate.getDate() + 365);
    const toTimestamp = Math.floor(Math.min(toDate.getTime(), END_DATE.getTime()) / 1000);
    
    console.log(`📊 Fetching ${currentDate.toISOString().split('T')[0]} to ${new Date(toTimestamp * 1000).toISOString().split('T')[0]}`);
    
    try {
      const data = await fetchMarketData(fromTimestamp, toTimestamp);
      if (data.prices && data.market_caps && data.total_volumes) {
        const dailyData = {};
        data.prices.forEach(([timestamp, price]) => {
          const date = new Date(timestamp).toISOString().split('T')[0];
          if (!dailyData[date]) dailyData[date] = { timestamp, price, volume: 0, marketCap: 0 };
        });
        data.total_volumes.forEach(([timestamp, volume]) => {
          const date = new Date(timestamp).toISOString().split('T')[0];
          if (dailyData[date]) dailyData[date].volume = volume;
        });
        data.market_caps.forEach(([timestamp, marketCap]) => {
          const date = new Date(timestamp).toISOString().split('T')[0];
          if (dailyData[date]) dailyData[date].marketCap = marketCap;
        });
        Object.entries(dailyData).forEach(([date, values]) => {
          csvRows.push([
            new Date(values.timestamp).toISOString(),
            date,
            values.price.toFixed(2),
            convertToEur(values.price),
            values.volume.toFixed(2),
            values.marketCap.toFixed(2)
          ].join(','));
        });
      }
      requestCount++;
      console.log(`✅ Request ${requestCount} (${csvRows.length - 1} days)`);
      await new Promise(resolve => setTimeout(resolve, 1200));
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
    currentDate.setDate(currentDate.getDate() + 365);
  }
  
  fs.writeFileSync(OUTPUT_FILE, csvRows.join('\n'));
  console.log(`\n🎉 ${csvRows.length - 1} days saved to ${OUTPUT_FILE}`);
}

main().catch(console.error);
