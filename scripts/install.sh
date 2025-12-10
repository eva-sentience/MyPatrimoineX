#!/bin/bash

###############################################################################
# PATRIMOINEX - SCRIPT D'INSTALLATION AUTOMATIQUE
# Automatise l'import des données historiques Bitcoin et le calcul des indicateurs
###############################################################################

set -e  # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPTS_DIR="$HOME/MyPatrimoineX/scripts"
APIFY_JSON="$SCRIPTS_DIR/apify-result.json"
BTC_CSV="$SCRIPTS_DIR/btc-historical-data.csv"
ENV_FILE="$SCRIPTS_DIR/.env"

###############################################################################
# FONCTIONS UTILITAIRES
###############################################################################

print_header() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════════════╗"
    echo "║          PATRIMOINEX - INSTALLATION AUTOMATIQUE                  ║"
    echo "║       Système d'indicateurs techniques Bitcoin                    ║"
    echo "╚════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${GREEN}▶ $1${NC}"
}

print_substep() {
    echo -e "  ${BLUE}→${NC} $1"
}

print_success() {
    echo -e "  ${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "  ${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "  ${RED}✗${NC} $1"
}

###############################################################################
# ÉTAPE 0 : VÉRIFICATIONS PRÉLIMINAIRES
###############################################################################

check_prerequisites() {
    print_step "Vérification des prérequis..."
    
    # Vérifier Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js installé: $NODE_VERSION"
    else
        print_error "Node.js non installé"
        exit 1
    fi
    
    # Vérifier npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm installé: $NPM_VERSION"
    else
        print_error "npm non installé"
        exit 1
    fi
    
    # Vérifier @supabase/supabase-js
    if [ -d "$HOME/MyPatrimoineX/node_modules/@supabase/supabase-js" ]; then
        print_success "@supabase/supabase-js installé"
    else
        print_warning "@supabase/supabase-js non trouvé, installation..."
        cd "$HOME/MyPatrimoineX"
        npm install @supabase/supabase-js
        print_success "@supabase/supabase-js installé"
    fi
    
    # Créer le répertoire scripts si nécessaire
    if [ ! -d "$SCRIPTS_DIR" ]; then
        mkdir -p "$SCRIPTS_DIR"
        print_success "Répertoire scripts créé"
    fi
    
    echo ""
}

###############################################################################
# ÉTAPE 1 : COPIER LES FICHIERS
###############################################################################

copy_files() {
    print_step "Copie des fichiers nécessaires..."
    
    # Copier les scripts
    if [ -f "/tmp/parse-apify-result.mjs" ]; then
        cp /tmp/parse-apify-result.mjs "$SCRIPTS_DIR/"
        chmod +x "$SCRIPTS_DIR/parse-apify-result.mjs"
        print_success "parse-apify-result.mjs copié"
    fi
    
    if [ -f "/tmp/import-historical-data.mjs" ]; then
        cp /tmp/import-historical-data.mjs "$SCRIPTS_DIR/"
        chmod +x "$SCRIPTS_DIR/import-historical-data.mjs"
        print_success "import-historical-data.mjs copié"
    fi
    
    if [ -f "/tmp/01-create-indicator-schema.sql" ]; then
        cp /tmp/01-create-indicator-schema.sql "$SCRIPTS_DIR/"
        print_success "01-create-indicator-schema.sql copié"
    fi
    
    if [ -f "/tmp/GUIDE-INSTALLATION.md" ]; then
        cp /tmp/GUIDE-INSTALLATION.md "$SCRIPTS_DIR/"
        print_success "GUIDE-INSTALLATION.md copié"
    fi
    
    # Vérifier que le JSON Apify existe
    if [ ! -f "$APIFY_JSON" ]; then
        print_warning "apify-result.json non trouvé dans $SCRIPTS_DIR"
        print_warning "Veuillez copier votre fichier Apify dans ce répertoire"
        read -p "Appuyez sur Entrée une fois le fichier copié..."
    fi
    
    echo ""
}

###############################################################################
# ÉTAPE 2 : CONFIGURATION SUPABASE
###############################################################################

configure_supabase() {
    print_step "Configuration de Supabase..."
    
    if [ -f "$ENV_FILE" ]; then
        print_substep "Fichier .env existant trouvé"
        source "$ENV_FILE"
        
        if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" = "https://your-project.supabase.co" ]; then
            print_warning "URL Supabase non configurée"
            configure_env
        else
            print_success "URL Supabase: $SUPABASE_URL"
        fi
    else
        configure_env
    fi
    
    echo ""
}

configure_env() {
    print_substep "Configuration des variables d'environnement..."
    
    read -p "Entrez l'URL de votre projet Supabase: " SUPABASE_URL
    read -p "Entrez votre Service Role Key: " SUPABASE_SERVICE_KEY
    
    cat > "$ENV_FILE" << EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
EOF
    
    print_success "Fichier .env créé"
}

###############################################################################
# ÉTAPE 3 : CRÉATION DU SCHÉMA SUPABASE
###############################################################################

create_schema() {
    print_step "Création du schéma Supabase..."
    
    print_substep "Ouvrez votre projet Supabase et:"
    print_substep "1. Allez dans SQL Editor"
    print_substep "2. Créez une nouvelle requête"
    print_substep "3. Copiez-collez le contenu de:"
    echo -e "     ${YELLOW}$SCRIPTS_DIR/01-create-indicator-schema.sql${NC}"
    print_substep "4. Exécutez la requête"
    
    read -p "Appuyez sur Entrée une fois le schéma créé..."
    
    print_success "Schéma créé (11 tables + 7 fonctions)"
    echo ""
}

###############################################################################
# ÉTAPE 4 : PARSING DU JSON APIFY
###############################################################################

parse_apify() {
    print_step "Parsing du JSON Apify..."
    
    if [ ! -f "$APIFY_JSON" ]; then
        print_error "Fichier $APIFY_JSON non trouvé"
        exit 1
    fi
    
    cd "$SCRIPTS_DIR"
    node parse-apify-result.mjs "$APIFY_JSON" "$BTC_CSV"
    
    if [ -f "$BTC_CSV" ]; then
        LINE_COUNT=$(wc -l < "$BTC_CSV")
        print_success "CSV généré avec $LINE_COUNT lignes"
    else
        print_error "Erreur lors de la génération du CSV"
        exit 1
    fi
    
    echo ""
}

###############################################################################
# ÉTAPE 5 : IMPORT DES DONNÉES
###############################################################################

import_data() {
    print_step "Import des données dans Supabase..."
    
    print_substep "Cela peut prendre 10-15 minutes..."
    print_substep "Le script va:"
    print_substep "  1. Importer 4100 lignes de prix historiques"
    print_substep "  2. Calculer tous les indicateurs techniques"
    print_substep "  3. Générer les signaux de trading"
    
    source "$ENV_FILE"
    cd "$SCRIPTS_DIR"
    
    export SUPABASE_URL
    export SUPABASE_SERVICE_KEY
    
    node import-historical-data.mjs "$BTC_CSV"
    
    if [ $? -eq 0 ]; then
        print_success "Import terminé avec succès"
    else
        print_error "Erreur lors de l'import"
        exit 1
    fi
    
    echo ""
}

###############################################################################
# ÉTAPE 6 : VÉRIFICATIONS FINALES
###############################################################################

verify_installation() {
    print_step "Vérifications finales..."
    
    print_substep "Fichiers créés dans $SCRIPTS_DIR:"
    ls -lh "$SCRIPTS_DIR" | grep -E '\.(mjs|sql|csv|json|md)$' | awk '{print "  - " $9 " (" $5 ")"}'
    
    echo ""
    print_success "Installation terminée !"
    echo ""
    print_substep "Prochaines étapes:"
    print_substep "1. Consultez $SCRIPTS_DIR/GUIDE-INSTALLATION.md"
    print_substep "2. Configurez N8N pour les mises à jour temps réel"
    print_substep "3. Intégrez le frontend"
    echo ""
}

###############################################################################
# FONCTION PRINCIPALE
###############################################################################

main() {
    print_header
    
    check_prerequisites
    copy_files
    configure_supabase
    create_schema
    parse_apify
    import_data
    verify_installation
    
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════════════╗"
    echo "║                    INSTALLATION TERMINÉE !                         ║"
    echo "║                                                                    ║"
    echo "║  Vous disposez maintenant de:                                      ║"
    echo "║  ✓ 4100 jours de données historiques Bitcoin                      ║"
    echo "║  ✓ 7 indicateurs techniques calculés                              ║"
    echo "║  ✓ Signaux de trading automatiques                                ║"
    echo "║  ✓ Infrastructure prête pour le frontend                          ║"
    echo "╚════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Exécution
main "$@"
