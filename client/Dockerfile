FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Installer un serveur web léger pour servir les fichiers statiques
RUN npm install -g serve

# Exposer le port (DigitalOcean utilise $PORT)
EXPOSE $PORT

# Variables d'environnement par défaut
ENV NODE_ENV=production

# Commande de démarrage avec variable PORT dynamique
CMD serve -s dist -l $PORT
