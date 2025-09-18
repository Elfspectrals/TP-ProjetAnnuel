# DigitalOcean Deployment Guide

## Overview

This guide walks you through deploying your full-stack application (React + Node.js + PostgreSQL) to DigitalOcean App Platform.

## Prerequisites

- GitHub repository with your code
- DigitalOcean account
- Your application should be ready for production

## Deployment Steps

### 1. Prepare Your Repository

Ensure all the configuration files are committed to your GitHub repository:

- `.do/app.yaml` - DigitalOcean App Platform configuration
- `docker-compose.prod.yml` - Production Docker compose file
- Updated `Dockerfile`s in both client and server directories

### 2. DigitalOcean App Platform Setup

1. **Connect GitHub Repository**

   - In DigitalOcean dashboard, go to Apps
   - Click "Create App"
   - Select "GitHub" as your source
   - Choose your repository: `Elfspectrals/TP-ProjetAnnuel`
   - Select branch: `main`
   - Enable "Autodeploy" for automatic redeployment on code changes

2. **Configure Services** (will be auto-detected from `.do/app.yaml`)

   **Backend Service (server):**

   - Name: `server`
   - Source Directory: `/server`
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Port: `8080`
   - Environment Variables:
     - `NODE_ENV=production`
     - `PORT=8080`
     - `DATABASE_URL=${db.DATABASE_URL}` (auto-provided)

   **Frontend Service (client):**

   - Name: `client`
   - Source Directory: `/client`
   - Build Command: `npm run build`
   - Run Command: `serve -s dist -l $PORT`
   - Port: `8080`
   - Environment Variables:
     - `NODE_ENV=production`
     - `VITE_API_URL=${server.PUBLIC_URL}/api`

   **Database:**

   - Type: PostgreSQL
   - Version: 16
   - Plan: Development Database ($7/month)

3. **Environment Variables**
   Add any additional environment variables in the DigitalOcean dashboard under your app's Settings > Environment Variables.

4. **Domain Configuration**
   - Your app will be accessible at: `https://your-app-name.ondigitalocean.app`
   - You can add a custom domain in the Settings section

### 3. Database Migration

After deployment, the database migrations will run automatically via the worker service defined in `app.yaml`.

If you need to run migrations manually:

1. Go to your app's console in DigitalOcean
2. Access the server component console
3. Run: `npx prisma migrate deploy`

### 3.1. Environment Variables Required

Make sure these environment variables are set in DigitalOcean:

**Server:**

- `NODE_ENV=production`
- `PORT=8080`
- `DATABASE_URL=${db.DATABASE_URL}` (auto-provided by DigitalOcean)

**Client:**

- `NODE_ENV=production`
- `PORT=8080`
- `VITE_API_URL=${server.PUBLIC_URL}` (auto-provided by DigitalOcean)

### 4. Monitoring and Logs

- View application logs in the DigitalOcean dashboard under Runtime Logs
- Monitor resource usage in the Insights tab
- Set up alerts for downtime or performance issues

## Local Testing with Production Configuration

Test your production setup locally:

```bash
# Using the production docker-compose file
docker-compose -f docker-compose.prod.yml up --build

# Access your application:
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
# Database: localhost:5432
```

## Troubleshooting

### Common Issues:

1. **Build Failures**

   - Check that all dependencies are listed in `package.json`
   - Ensure TypeScript compiles without errors
   - Verify Docker build context includes all necessary files

2. **Database Connection Issues**

   - Ensure `DATABASE_URL` environment variable is properly set
   - Check that Prisma schema is up to date
   - Verify database migrations have run successfully

3. **Environment Variables**

   - Check that all required environment variables are set in DigitalOcean
   - Ensure API URLs point to the correct endpoints
   - Verify CORS settings allow requests from your frontend domain

4. **Port Configuration**
   - DigitalOcean App Platform expects applications to run on port `8080`
   - Ensure your applications listen on `$PORT` environment variable

### Useful Commands:

```bash
# Check application status
curl https://your-app-name.ondigitalocean.app/health

# Test API endpoints
curl https://your-app-name.ondigitalocean.app/api/endpoint

# View production logs locally
docker-compose -f docker-compose.prod.yml logs -f
```

## Cost Estimation

- Basic App (2 services): ~$12/month
- Development Database: ~$7/month
- **Total: ~$19/month**

For production workloads, consider upgrading to higher-tier plans for better performance and reliability.

## Next Steps

1. Set up monitoring and alerting
2. Configure custom domain
3. Implement CI/CD pipelines
4. Set up staging environment
5. Configure backup strategies for your database
