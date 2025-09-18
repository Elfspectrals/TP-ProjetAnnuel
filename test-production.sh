#!/bin/bash

# Script pour tester la configuration de production localement
echo "🚀 Test de la configuration de production locale"
echo "================================================"

# Nettoyer les conteneurs existants
echo "🧹 Nettoyage des conteneurs existants..."
docker-compose -f docker-compose.prod.yml down --volumes --remove-orphans

# Construire et démarrer les services
echo "🏗️  Construction et démarrage des services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Attendre que les services démarrent
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérifier la santé des services
echo "🔍 Vérification de la santé des services..."

echo "📊 Backend health check:"
curl -f http://localhost:8080/health || echo "❌ Backend health check failed"

echo -e "\n🌐 Frontend check:"
curl -f http://localhost:3000/ || echo "❌ Frontend check failed"

echo -e "\n📋 Services en cours d'exécution:"
docker-compose -f docker-compose.prod.yml ps

echo -e "\n📝 Logs récents:"
docker-compose -f docker-compose.prod.yml logs --tail=20

echo -e "\n✅ Test terminé! Vérifiez les résultats ci-dessus."
echo "Pour accéder à l'application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8080"
echo "  Health:   http://localhost:8080/health"
