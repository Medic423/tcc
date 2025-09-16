# TCC Production Deployment Guide

## 🚀 Quick Deploy to Render

This guide will help you deploy the TCC (Transport Control Center) backend to Render using the production branch.

### Prerequisites

- GitHub repository with the `production` branch
- Render account (free tier available)
- Email account for SMTP configuration

### 🎯 Deployment Steps

#### Option 1: One-Click Deploy (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "feat: Add Render deployment configuration"
   git push origin production
   ```

2. **Deploy to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the `production` branch
   - Render will automatically detect the `render.yaml` configuration
   - Click "Apply" to deploy

#### Option 2: Manual Configuration

1. **Create Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `production` branch
   - Set Root Directory to `backend`

2. **Configure Service:**
   - **Name:** `tcc-backend`
   - **Environment:** `Node`
   - **Region:** `Oregon` (or closest to your users)
   - **Plan:** `Starter` (free)

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5001
   JWT_SECRET=your-secure-jwt-secret-here
   DATABASE_URL=postgresql://... (from Render database)
   FRONTEND_URL=https://your-frontend-app.onrender.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Set Build Commands:**
   - **Build Command:** `npm install && npm run build:prod`
   - **Start Command:** `npm start`

### 🗄️ Database Setup

1. **Create PostgreSQL Database:**
   - In Render Dashboard, click "New +" → "PostgreSQL"
   - **Name:** `tcc-database`
   - **Plan:** `Starter` (free)
   - **Region:** Same as your service

2. **Database will be automatically provisioned** with the unified schema

### ✅ Verification

After deployment, test your service:

```bash
# Health check
curl https://your-backend-app.onrender.com/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-09-06T18:30:55.904Z",
  "databases": "connected"
}
```

### 🔧 Configuration Files

- **`render.yaml`** - Render deployment configuration
- **`backend/production.env`** - Production environment variables template
- **`backend/DEPLOYMENT.md`** - Detailed deployment documentation
- **`backend/prisma/schema-production.prisma`** - Unified database schema

### 🚨 Important Notes

- **Development environment remains untouched** - all changes are on the `production` branch
- **Database is unified** - single PostgreSQL database with all models
- **Environment variables** are set in Render dashboard, not in files
- **SMTP configuration** is required for email notifications

### 🆘 Troubleshooting

#### Build Fails
- Check that you're on the `production` branch
- Verify all dependencies are in `package.json`
- Check Render build logs for specific errors

#### Database Connection Issues
- Verify `DATABASE_URL` is correctly set
- Check that the database is in the same region as your service
- Ensure the database is not sleeping (free tier limitation)

#### Service Won't Start
- Check that `PORT` environment variable is set to `5001`
- Verify all required environment variables are set
- Check Render service logs for startup errors

### 📞 Support

If you encounter issues:
1. Check the Render service logs
2. Verify all environment variables are set correctly
3. Ensure the database is accessible
4. Check that the production build works locally

### 🔄 Updates

To update your deployment:
1. Make changes to the `production` branch
2. Push to GitHub
3. Render will automatically redeploy

---

**Remember:** The development environment on the `main` branch remains completely separate and unaffected by production deployments.
