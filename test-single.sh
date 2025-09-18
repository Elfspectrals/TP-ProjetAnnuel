#!/bin/bash

# Script pour tester le déploiement unifié localement
echo "🚀 Test du déploiement unifié (Dockerfile.single)"
echo "================================================="

# Nettoyer
echo "🧹 Nettoyage..."
docker stop tp-app-test 2>/dev/null || true
docker rm tp-app-test 2>/dev/null || true

# Construire l'image
echo "🏗️  Construction de l'image..."
docker build -f Dockerfile.single -t tp-app-test .

# Démarrer le conteneur
echo "🚀 Démarrage du conteneur..."
docker run -d --name tp-app-test -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e DATABASE_URL="postgresql://test:test@host.docker.internal:5432/test" \
  tp-app-test

# Attendre le démarrage
echo "⏳ Attente du démarrage (30s)..."
sleep 30

# Tests
echo "🔍 Tests de l'application..."

echo "📊 Health check:"
curl -f http://localhost:8080/health || echo "❌ Health check failed"

echo -e "\n🌐 Homepage:"
curl -f http://localhost:8080/ || echo "❌ Homepage failed"

echo -e "\n📋 Status du conteneur:"
docker ps | grep tp-app-test

echo -e "\n📝 Logs récents:"
docker logs --tail=20 tp-app-test

echo -e "\n✅ Test terminé!"
echo "Pour nettoyer: docker stop tp-app-test && docker rm tp-app-test"
