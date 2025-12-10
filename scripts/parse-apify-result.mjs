#!/usr/bin/env node

/**
 * parse-apify-result.mjs
 * Parse Apify Website Content Crawler JSON output pour extraire les données historiques Bitcoin
 * depuis Yahoo Finance et les convertir au format Supabase
 */

import { readFile, writeFile } from 'fs/promises';

// Configuration
const INPUT_FILE = process.argv[2] || './apify-result.json';
const OUTPUT_CSV = process.argv[3] || './btc-historical-data.csv';

// Conversion mois anglais → numéro
const MONTHS = {
  'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
  'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
  'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
};

/**
 * Convertit une date "Dec 7, 2025" en format ISO "2025-12-07"
 */
function parseYahooDate(dateStr) {
  const match = dateStr.match(/^([A-Z][a-z]{2})\s+(\d{1,2}),\s+(\d{4})$/);
  if (!match) {
    throw new Error(`Format de date invalide: ${dateStr}`);
  }
  
  const [_, monthStr, day, year] = match;
  const month = MONTHS[monthStr];
  if (!month) {
    throw new Error(`Mois invalide: ${monthStr}`);
  }
  
  const dayPadded = day.padStart(2, '0');
  return `${year}-${month}-${dayPadded}`;
}

/**
 * Nettoie une valeur numérique (enlève virgules, gère les nombres décimaux)
 */
function parseNumber(str) {
  if (!str || str === '-' || str === 'null') {
    return null;
  }
  // Enlever les virgules (séparateurs de milliers)
  const cleaned = str.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Parse le markdown pour extraire les données historiques
 */
function parseMarkdown(markdown) {
  const lines = markdown.split('\n').map(line => line.trim());
  const data = [];
  
  // Pattern pour détecter une date
  const datePattern = /^[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}$/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Si c'est une ligne de date
    if (datePattern.test(line)) {
      try {
        const date = parseYahooDate(line);
        
        // Les 6 lignes suivantes sont : Open, High, Low, Close, Adj Close, Volume
        const open = parseNumber(lines[i + 2]);
        const high = parseNumber(lines[i + 4]);
        const low = parseNumber(lines[i + 6]);
        const close = parseNumber(lines[i + 8]);
        const adjClose = parseNumber(lines[i + 10]);
        const volume = parseNumber(lines[i + 12]);
        
        // Validation basique
        if (close !== null && volume !== null) {
          data.push({
            date,
            open,
            high,
            low,
            close,
            adjClose,
            volume
          });
        } else {
          console.warn(`⚠️  Données incomplètes pour ${date}`);
        }
      } catch (error) {
        console.error(`Erreur parsing ligne ${i}: ${error.message}`);
      }
    }
  }
  
  return data;
}

/**
 * Convertit les données au format Supabase et génère le CSV
 */
function generateCSV(data) {
  // Header CSV (format Supabase indicator_btc_price_history)
  const header = 'date,price_usd,price_eur,volume_24h,market_cap';
  
  // Convertir chaque ligne
  // Note: price_eur et market_cap seront calculés par les fonctions SQL Supabase
  const rows = data.map(row => {
    return [
      row.date,
      row.close.toFixed(8),           // price_usd
      '',                              // price_eur (à calculer)
      row.volume.toFixed(2),           // volume_24h
      ''                               // market_cap (à calculer)
    ].join(',');
  });
  
  return [header, ...rows].join('\n');
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('🔍 Lecture du fichier Apify...');
    const jsonContent = await readFile(INPUT_FILE, 'utf-8');
    const apifyData = JSON.parse(jsonContent);
    
    if (!Array.isArray(apifyData) || apifyData.length === 0) {
      throw new Error('Le fichier JSON Apify est vide ou invalide');
    }
    
    const markdown = apifyData[0].markdown;
    if (!markdown) {
      throw new Error('Pas de contenu markdown dans le JSON Apify');
    }
    
    console.log('📊 Parsing du markdown...');
    const historicalData = parseMarkdown(markdown);
    
    console.log(`✅ ${historicalData.length} lignes de données extraites`);
    
    // Vérifier la couverture temporelle
    if (historicalData.length > 0) {
      const dates = historicalData.map(d => d.date).sort();
      console.log(`📅 Période couverte: ${dates[0]} → ${dates[dates.length - 1]}`);
      
      // Détecter les gaps (jours manquants)
      let gaps = 0;
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          gaps += (diffDays - 1);
        }
      }
      
      if (gaps > 0) {
        console.log(`⚠️  ${gaps} jours manquants détectés (weekends/jours fériés normaux)`);
      }
    }
    
    console.log('💾 Génération du CSV...');
    const csv = generateCSV(historicalData);
    
    await writeFile(OUTPUT_CSV, csv, 'utf-8');
    console.log(`✅ CSV exporté: ${OUTPUT_CSV}`);
    
    // Stats finales
    console.log('\n📈 Statistiques:');
    console.log(`   - Nombre total de jours: ${historicalData.length}`);
    console.log(`   - Prix min: $${Math.min(...historicalData.map(d => d.close)).toFixed(2)}`);
    console.log(`   - Prix max: $${Math.max(...historicalData.map(d => d.close)).toFixed(2)}`);
    console.log(`   - Volume moyen: $${(historicalData.reduce((sum, d) => sum + d.volume, 0) / historicalData.length).toFixed(2)}`);
    
    console.log('\n🎯 Prochaine étape:');
    console.log(`   Importer dans Supabase: COPY indicator_btc_price_history(date,price_usd,volume_24h) FROM '${OUTPUT_CSV}' WITH CSV HEADER;`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécution
main();
