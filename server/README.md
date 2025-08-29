# Server API

Backend API construit avec Node.js, Express, PostgreSQL et Prisma.

## 🚀 Démarrage rapide

### Avec Docker (recommandé)

```bash
# Depuis la racine du projet
docker-compose up --build
```

### En développement local

```bash
cd server
npm install
npm run dev
```

## 📋 Scripts disponibles

- `npm run build` - Compiler TypeScript
- `npm start` - Démarrer en production
- `npm run dev` - Démarrer en mode développement avec hot reload
- `npm run db:generate` - Générer le client Prisma
- `npm run db:push` - Pousser le schéma vers la DB
- `npm run db:migrate` - Créer et appliquer une migration
- `npm run db:studio` - Ouvrir Prisma Studio
- `npm run db:seed` - Alimenter la DB avec des données de test

## 🗄️ Base de données

### Configuration

Le serveur utilise PostgreSQL avec Prisma ORM. La configuration se fait via la variable d'environnement `DATABASE_URL`.

### Schéma de base

Le schéma inclut deux modèles de base :

- **User** : Utilisateurs avec email et nom
- **Post** : Articles liés aux utilisateurs

### Migrations

```bash
# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations
npx prisma migrate deploy
```

## 🔗 Endpoints API

### Santé de l'API

- `GET /` - Informations de base de l'API
- `GET /health` - Vérification de l'état de l'API et de la DB

### Utilisateurs

- `GET /api/users` - Lister tous les utilisateurs
- `POST /api/users` - Créer un nouvel utilisateur

### Posts

- `GET /api/posts` - Lister tous les posts
- `POST /api/posts` - Créer un nouveau post

## 🔧 Variables d'environnement

Copiez `.env.example` vers `.env` et ajustez les valeurs :

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb?schema=public"
PORT=3000
NODE_ENV=development
```

## 🐳 Docker

Le serveur est configuré pour fonctionner avec Docker. Le `Dockerfile` utilise Node.js 18 Alpine pour une image légère.

### Build local

```bash
docker build -t server .
docker run -p 3000:3000 server
```
