# Manual DigitalOcean Deployment Guide

Since the automated configuration isn't working, let's deploy manually through the DigitalOcean interface.

## Step 1: Delete Current App

1. Go to your DigitalOcean Apps dashboard
2. Delete the current "tp-projet-annuel" app (it's failing anyway)

## Step 2: Create New App - Manual Configuration

### Backend Service (API)

1. **Create App** → **From GitHub**
2. **Repository**: `Elfspectrals/TP-ProjetAnnuel`
3. **Branch**: `main`
4. **Source Directory**: `/server`
5. **Service Type**: Web Service
6. **Environment**: Node.js
7. **Build Command**: `npm ci && npm run build`
8. **Run Command**: `npm start`
9. **HTTP Port**: `8080`
10. **Environment Variables**:
    - `NODE_ENV` = `production`
    - `DATABASE_URL` = `${db.DATABASE_URL}` (auto-filled after adding database)

### Frontend Service (Web)

1. **Add Component** → **Web Service**
2. **Source Directory**: `/client`
3. **Service Type**: Static Site
4. **Environment**: Node.js
5. **Build Command**: `npm ci && npm run build`
6. **Output Directory**: `dist`
7. **Environment Variables**:
   - `VITE_API_URL` = `${api.PUBLIC_URL}/api` (replace 'api' with your backend service name)

### Database

1. **Add Component** → **Database**
2. **Engine**: PostgreSQL
3. **Version**: 16
4. **Plan**: Development Database ($7/month)

### Routes (important!)

1. **Backend service routes**: `/api` and `/api/*`
2. **Frontend service routes**: `/` (catch-all)

## Step 3: Environment Variables

Make sure these are set correctly:

**Backend (api service)**:

- `NODE_ENV` = `production`
- `DATABASE_URL` = `${db.DATABASE_URL}`

**Frontend (web service)**:

- `VITE_API_URL` = `https://your-api-service-url/api`

## Step 4: Deploy

1. Review all settings
2. Click **Create Resources**
3. Wait for deployment (10-15 minutes)

## Troubleshooting

If you still get "determine start command" errors:

1. **Check the Procfile**: Make sure `/server/Procfile` exists with `web: npm start`
2. **Check package.json**: Ensure `"start": "node dist/index.js"` script exists
3. **Try Docker**: Change service type to "Docker" and use the Dockerfile

## Alternative: One-Service Approach

If the multi-service approach keeps failing, try deploying just the backend first:

1. Create app with only the `/server` directory
2. Serve the frontend from the backend using Express static files
3. Update the backend to serve built React files from `/client/dist`

Let me know which approach you'd like to try!
