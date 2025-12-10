import fs from 'fs';

const rawData = fs.readFileSync('bitcoin_raw.csv', 'utf-8');
const lines = rawData.split('\n').slice(1); // Skip header

const csvRows = ['timestamp,date,price_usd,price_eur,volume_24h,market_cap'];

lines.forEach(line => {
  const parts = line.split(',');
  if (parts.length >= 5 && parts[0]) {
    const date = parts[0]; // Format: YYYY-MM-DD
    const close = parseFloat(parts[4]); // Close price
    const volume = parseFloat(parts[6] || 0);
    
    if (!isNaN(close) && close > 0) {
      const timestamp = new Date(date).toISOString();
      const priceEur = (close / 1.1).toFixed(2);
      const marketCap = (close * 19000000).toFixed(2); // Approximation
      
      csvRows.push([
        timestamp,
        date,
        close.toFixed(2),
        priceEur,
        volume.toFixed(2),
        marketCap
      ].join(','));
    }
  }
});

fs.writeFileSync('btc-price-history.csv', csvRows.join('\n'));
console.log(`✅ ${csvRows.length - 1} days converted!`);
