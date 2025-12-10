#!/usr/bin/env node

/**
 * import-historical-data.mjs
 * Importe les données historiques Bitcoin depuis le CSV vers Supabase
 * et calcule tous les indicateurs techniques
 */

import { readFile } from 'fs/promises';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (à adapter selon votre projet)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'your-service-role-key';

// Fichier CSV à importer
const CSV_FILE = process.argv[2] || './btc-historical-data.csv';

// Taille des batches pour l'insertion
const BATCH_SIZE = 500;

// Initialiser le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Parse une ligne CSV
 */
function parseCSVLine(line, headers) {
  const values = line.split(',');
  const row = {};
  
  headers.forEach((header, index) => {
    const value = values[index]?.trim();
    if (value && value !== '') {
      // Convertir en nombre si c'est price_usd ou volume_24h
      if (header === 'price_usd' || header === 'volume_24h') {
        row[header] = parseFloat(value);
      } else {
        row[header] = value;
      }
    }
  });
  
  return row;
}

/**
 * Importe les données par batch
 */
async function importDataBatch(data, batchNumber, totalBatches) {
  console.log(`📤 Import batch ${batchNumber}/${totalBatches} (${data.length} lignes)...`);
  
  const { error } = await supabase
    .from('indicator_btc_price_history')
    .upsert(data, {
      onConflict: 'date',
      ignoreDuplicates: false
    });
  
  if (error) {
    throw new Error(`Erreur batch ${batchNumber}: ${error.message}`);
  }
  
  console.log(`✅ Batch ${batchNumber}/${totalBatches} importé`);
}

/**
 * Calcule tous les indicateurs pour toutes les dates
 */
async function calculateAllIndicators(dates) {
  console.log('\n📊 Calcul des indicateurs techniques...');
  console.log(`⏳ ${dates.length} dates à traiter (cela peut prendre plusieurs minutes)...`);
  
  let processed = 0;
  const total = dates.length;
  const startTime = Date.now();
  
  // Traiter par batch pour afficher la progression
  for (let i = 0; i < dates.length; i += 10) {
    const batch = dates.slice(i, Math.min(i + 10, dates.length));
    
    // Appeler la fonction SQL pour chaque date
    for (const date of batch) {
      const { error } = await supabase.rpc('update_all_indicators', {
        target_date: date
      });
      
      if (error) {
        console.warn(`⚠️  Erreur calcul pour ${date}: ${error.message}`);
      }
      
      processed++;
    }
    
    // Afficher la progression toutes les 100 lignes
    if (processed % 100 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = processed / elapsed;
      const remaining = (total - processed) / rate;
      console.log(`   ${processed}/${total} (${(processed / total * 100).toFixed(1)}%) - ETA: ${Math.ceil(remaining)}s`);
    }
  }
  
  const elapsed = (Date.now() - startTime) / 1000;
  console.log(`✅ Tous les indicateurs calculés en ${Math.ceil(elapsed)}s`);
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('🚀 Import des données historiques Bitcoin dans Supabase\n');
    
    // Vérifier la configuration
    if (SUPABASE_URL === 'https://your-project.supabase.co') {
      console.error('❌ Erreur: SUPABASE_URL non configuré');
      console.log('Définissez les variables d\'environnement:');
      console.log('  export SUPABASE_URL="https://your-project.supabase.co"');
      console.log('  export SUPABASE_SERVICE_KEY="your-service-role-key"');
      process.exit(1);
    }
    
    console.log('📂 Lecture du CSV...');
    const csvContent = await readFile(CSV_FILE, 'utf-8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      throw new Error('Le fichier CSV est vide ou invalide');
    }
    
    // Parser le CSV
    const headers = lines[0].split(',').map(h => h.trim());
    const dataLines = lines.slice(1);
    
    console.log(`✅ ${dataLines.length} lignes à importer`);
    console.log(`📅 Colonnes: ${headers.join(', ')}\n`);
    
    // Convertir en objets
    const allData = dataLines.map(line => parseCSVLine(line, headers));
    
    // Vérifier que les données sont valides
    const validData = allData.filter(row => row.date && row.price_usd);
    console.log(`✅ ${validData.length} lignes valides (${allData.length - validData.length} ignorées)\n`);
    
    // Importer par batch
    const totalBatches = Math.ceil(validData.length / BATCH_SIZE);
    
    for (let i = 0; i < validData.length; i += BATCH_SIZE) {
      const batch = validData.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      
      await importDataBatch(batch, batchNumber, totalBatches);
      
      // Petit délai entre les batches pour ne pas surcharger Supabase
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n✅ Import terminé avec succès!\n');
    
    // Calculer les indicateurs
    const dates = validData.map(row => row.date).sort();
    await calculateAllIndicators(dates);
    
    // Statistiques finales
    console.log('\n📈 Statistiques finales:');
    
    const { data: priceStats } = await supabase
      .from('indicator_btc_price_history')
      .select('date, price_usd')
      .order('date', { ascending: false })
      .limit(1);
    
    if (priceStats && priceStats.length > 0) {
      console.log(`   Dernière date: ${priceStats[0].date}`);
      console.log(`   Prix actuel: $${priceStats[0].price_usd.toFixed(2)}`);
    }
    
    const { count: totalCount } = await supabase
      .from('indicator_btc_price_history')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   Total de jours: ${totalCount}`);
    
    const { count: indicatorsCount } = await supabase
      .from('indicator_trading_signals')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   Indicateurs calculés: ${indicatorsCount}`);
    
    console.log('\n🎉 Import et calcul des indicateurs terminés!');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Exécution
main();
