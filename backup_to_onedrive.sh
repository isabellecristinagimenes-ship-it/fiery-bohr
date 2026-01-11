#!/bin/bash

# Configuration
# Default recommended path for OneDrive on Mac
# You can change this to your specific path if different
BACKUP_DIR="$HOME/OneDrive/Backup_Imobiliaria"
DATE_STAMP=$(date +"%Y-%m-%d_%H-%M")
FULL_BACKUP_PATH="$BACKUP_DIR/$DATE_STAMP"

echo "🚀 Iniciando Backup do Sistema..."
echo "📂 Destino: $FULL_BACKUP_PATH"

# Create Directories
mkdir -p "$FULL_BACKUP_PATH/Frontend"
mkdir -p "$FULL_BACKUP_PATH/Backend"
mkdir -p "$FULL_BACKUP_PATH/Componentes_Especiais/Painel_Login"

# --- BACKEND BACKUP ---
echo "📦 Copiando Backend (ignorando node_modules)..."
rsync -av --progress backend/ \
    --exclude node_modules \
    --exclude .git \
    --exclude .DS_Store \
    "$FULL_BACKUP_PATH/Backend/"

# --- FRONTEND BACKUP ---
echo "📦 Copiando Frontend (ignorando node_modules)..."
rsync -av --progress frontend/ \
    --exclude node_modules \
    --exclude dist \
    --exclude .git \
    --exclude .DS_Store \
    "$FULL_BACKUP_PATH/Frontend/"

# --- SPECIAL COMPONENTS ---
echo "💎 Exportando componentes especiais..."
cp frontend/src/pages/LoginPage.jsx "$FULL_BACKUP_PATH/Componentes_Especiais/Painel_Login/"
cp frontend/src/index.css "$FULL_BACKUP_PATH/Componentes_Especiais/Painel_Login/estilos_do_login.css"
cp frontend/public/logo.png "$FULL_BACKUP_PATH/Componentes_Especiais/Painel_Login/logo.png"

# --- CREATE ZIP (Optional but recommended for cloud sync) ---
echo "🤐 Compactando para envio..."
cd "$BACKUP_DIR"
zip -r "Full_Backup_$DATE_STAMP.zip" "$DATE_STAMP"

echo "✅ Backup Concluído com Sucesso!"
echo "📍 Você pode encontrar seus arquivos em: $BACKUP_DIR"
