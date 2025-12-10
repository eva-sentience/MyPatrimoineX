import yfinance as yf
import pandas as pd
from datetime import datetime

print("📊 Downloading Bitcoin data from Yahoo Finance...")

# Télécharger toutes les données disponibles
btc = yf.Ticker("BTC-USD")
df = btc.history(period="max")

# Préparer pour Supabase
df['date'] = df.index.strftime('%Y-%m-%d')
df['timestamp'] = df.index
df['price_usd'] = df['Close']
df['price_eur'] = df['Close'] / 1.1
df['volume_24h'] = df['Volume']
df['market_cap'] = df['Close'] * 19500000  # Approximation

# Sélectionner colonnes
output = df[['timestamp', 'date', 'price_usd', 'price_eur', 'volume_24h', 'market_cap']]

# Sauvegarder
output.to_csv('btc-price-history.csv', index=False)
print(f"✅ {len(output)} days downloaded!")
print(f"📅 From {output['date'].min()} to {output['date'].max()}")
