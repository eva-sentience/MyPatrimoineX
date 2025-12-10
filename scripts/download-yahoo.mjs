import axios from 'axios';
import fs from 'fs';

const startDate = Math.floor(new Date('2014-09-17').getTime() / 1000);
const endDate = Math.floor(Date.now() / 1000);

console.log('📊 Downloading Bitcoin data from Yahoo Finance...');

const url = `https://query1.finance.yahoo.com/v7/finance/download/BTC-USD?period1=${startDate}&period2=${endDate}&interval=1d&events=history`;

try {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'text/csv'
    }
  });
  
  const lines = response.data.split('\n');
  const csvRows = ['timestamp,date,price_usd,price_eur,volume_24h,market_cap'];
  
  lines.slice(1).forEach(line => {
    const parts = line.split(',');
    if (parts.length >= 6 && parts[0]) {
      const date = parts[0];
      const close = parseFloat(parts[4]);
      const volume = parseFloat(parts[6] || 0);
      
      if (!isNaN(close)) {
        const timestamp = new Date(date).toISOString();
        const priceEur = (close / 1.1).toFixed(2);
        const marketCap = (close * 19500000).toFixed(2);
        
        csvRows.push([timestamp, date, close.toFixed(2), priceEur, volume.toFixed(2), marketCap].join(','));
      }
    }
  });
  
  fs.writeFileSync('btc-price-history.csv', csvRows.join('\n'));
  console.log(`✅ ${csvRows.length - 1} days downloaded!`);
  console.log(`📅 File saved: btc-price-history.csv`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
