import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface ProfessionalSearchProps {
  onSelect: (asset: { name: string; symbol: string; pair: string; logo?: string }) => void;
}

const POPULAR_CRYPTOS = [
  { name: 'Bitcoin', symbol: 'BTC', pair: 'BINANCE:BTCUSDT', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
  { name: 'Ethereum', symbol: 'ETH', pair: 'BINANCE:ETHUSDT', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  { name: 'Solana', symbol: 'SOL', pair: 'BINANCE:SOLUSDT', logo: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
  { name: 'Cardano', symbol: 'ADA', pair: 'BINANCE:ADAUSDT', logo: 'https://cryptologos.cc/logos/cardano-ada-logo.png' },
  { name: 'XRP', symbol: 'XRP', pair: 'BINANCE:XRPUSDT', logo: 'https://cryptologos.cc/logos/xrp-xrp-logo.png' },
  { name: 'Polkadot', symbol: 'DOT', pair: 'BINANCE:DOTUSDT', logo: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png' },
  { name: 'Avalanche', symbol: 'AVAX', pair: 'BINANCE:AVAXUSDT', logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.png' },
  { name: 'Chainlink', symbol: 'LINK', pair: 'BINANCE:LINKUSDT', logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png' },
  { name: 'Polygon', symbol: 'MATIC', pair: 'BINANCE:MATICUSDT', logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png' },
  { name: 'Litecoin', symbol: 'LTC', pair: 'BINANCE:LTCUSDT', logo: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png' },
];

export const ProfessionalSearch: React.FC<ProfessionalSearchProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredResults, setFilteredResults] = useState(POPULAR_CRYPTOS);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredResults(POPULAR_CRYPTOS);
    } else {
      const filtered = POPULAR_CRYPTOS.filter(
        (crypto) =>
          crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResults(filtered);
    }
  }, [searchTerm]);

  const handleSelect = (asset: typeof POPULAR_CRYPTOS[0]) => {
    onSelect(asset);
    setSearchTerm(asset.name);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Rechercher une crypto..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition"
        />
      </div>

      {isOpen && filteredResults.length > 0 && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden z-20 max-h-80 overflow-y-auto">
            {filteredResults.map((crypto) => (
              <button
                key={crypto.symbol}
                onClick={() => handleSelect(crypto)}
                className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition text-left border-b border-white/5 last:border-b-0"
              >
                {crypto.logo && (
                  <img src={crypto.logo} alt={crypto.name} className="w-8 h-8 rounded-full bg-white/5 p-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{crypto.name}</p>
                  <p className="text-gray-500 text-xs">{crypto.symbol}</p>
                </div>
                <span className="text-xs text-gray-600 font-mono">{crypto.pair.split(':')[1]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
