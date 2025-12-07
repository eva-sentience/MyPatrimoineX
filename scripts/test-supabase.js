// ============================================
// Test Supabase Connection
// ============================================

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credentials Supabase manquantes dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔌 Test de connexion Supabase...');
console.log(`📡 URL: ${supabaseUrl}`);
console.log('');

// Test 1: Connection
try {
  const { data, error } = await supabase
    .from('patrimoinex_market_indicators')
    .select('count')
    .limit(1);

  if (error) throw error;
  
  console.log('✅ Connexion Supabase réussie');
  console.log('');
} catch (error) {
  console.error('❌ Erreur de connexion:', error.message);
  process.exit(1);
}

// Test 2: List tables
try {
  const { data: tables, error } = await supabase
    .from('patrimoinex_assets')
    .select('id')
    .limit(1);

  if (error && !error.message.includes('0 rows')) throw error;
  
  console.log('✅ Table patrimoinex_assets accessible');
  console.log('');
} catch (error) {
  console.error('❌ Erreur table assets:', error.message);
}

// Test 3: Check indicators
try {
  const { data, error } = await supabase
    .from('patrimoinex_market_indicators')
    .select('title_fr')
    .limit(3);

  if (error) throw error;
  
  console.log('✅ Indicateurs de marché:');
  if (data && data.length > 0) {
    data.forEach(ind => console.log(`   - ${ind.title_fr}`));
  } else {
    console.log('   (Aucun indicateur trouvé - exécuter supabase/seed.sql)');
  }
  console.log('');
} catch (error) {
  console.error('⚠️  Pas d\'indicateurs:', error.message);
}

console.log('🎉 Tests terminés avec succès !');
console.log('');
console.log('Prochaines étapes:');
console.log('1. Exécuter supabase/seed.sql pour ajouter des données de test');
console.log('2. Lancer l\'app: npm run dev');
console.log('3. Ouvrir: http://localhost:3000');
