#!/bin/bash

# ============================================
# PatrimoineX Setup Script
# ============================================

echo "🚀 Configuration de PatrimoineX..."
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "📥 Installer Node.js : https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node --version) détecté"

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Créer .env.local si inexistant
if [ ! -f .env.local ]; then
    echo "⚙️  Création du fichier .env.local..."
    cat > .env.local << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=https://fixymduhojtfaltmyixa.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeHltZHVob2p0ZmFsdG15aXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjU4MjksImV4cCI6MjA3OTc0MTgyOX0.fM-6CsiL5XneD4aMUgZhJvu1DTYOD2SOYFrgPBk-2bg

# Gemini API Key (optionnel)
GEMINI_API_KEY=
EOF
    echo "✅ Fichier .env.local créé"
else
    echo "✅ Fichier .env.local existe déjà"
fi

echo ""
echo "🎉 Configuration terminée !"
echo ""
echo "Pour lancer l'application :"
echo "  npm run dev"
echo ""
echo "Puis ouvrir : http://localhost:3000"
