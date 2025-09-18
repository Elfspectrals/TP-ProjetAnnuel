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

# Exposer le port (DigitalOcean utilise $PORT)
EXPOSE 8080

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=8080

# Commande de démarrage
CMD ["npm", "start"]
