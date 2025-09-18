#!/bin/bash

# Script de démarrage robuste pour DigitalOcean
echo "🚀 Starting application..."

# Vérifier si les fichiers compilés existent
if [ -f "dist/index.js" ]; then
    echo "✅ Compiled files found, starting directly..."
    node dist/index.js
else
    echo "⚠️  Compiled files not found, rebuilding..."
    
    # Vérifier si le client Prisma existe
    if [ ! -f "prisma/generated/client/index.d.ts" ]; then
        echo "🔄 Generating Prisma client..."
        npm run prisma:generate-all
    fi
    
    # Compiler l'application
    echo "🔨 Building application..."
    npm run build
    
    # Démarrer l'application
    echo "▶️  Starting application..."
    node dist/index.js
fi
