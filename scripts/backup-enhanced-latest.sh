#!/bin/bash

# TCC Enhanced Backup Script - Latest Version
# This script includes ALL environment files and Vercel configuration
# Created: 2025-09-25
# Version: Enhanced with dev/prod separation

PROJECT_DIR="/Users/scooper/Code/tcc-new-project"
BACKUP_DIR="${1:-/Volumes/Acasis}/tcc-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="tcc-backup-$TIMESTAMP"

echo "🔄 Starting TCC project enhanced backup..."
echo "Project: $PROJECT_DIR"
echo "Backup to: $BACKUP_DIR/$BACKUP_NAME"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

# 1. Backup project files
echo "📦 Creating project backup..."
cp -r "$PROJECT_DIR" "$BACKUP_DIR/$BACKUP_NAME/project"

# Remove node_modules to save space
echo "🧹 Cleaning up node_modules..."
rm -rf "$BACKUP_DIR/$BACKUP_NAME/project/backend/node_modules"
rm -rf "$BACKUP_DIR/$BACKUP_NAME/project/frontend/node_modules"
rm -rf "$BACKUP_DIR/$BACKUP_NAME/project/node_modules"

# 1.5. Ensure all environment files are included (they should be in .gitignore but backup explicitly)
echo "🔐 Verifying environment files are backed up..."
echo "Environment files found:"
find "$BACKUP_DIR/$BACKUP_NAME/project" -name ".env*" -type f | while read file; do
    echo "  ✅ $(basename $(dirname $file))/$(basename $file)"
done

# Verify Vercel configuration is backed up
echo "🚀 Verifying Vercel configuration..."
if [ -d "$BACKUP_DIR/$BACKUP_NAME/project/.vercel" ]; then
    echo "  ✅ .vercel/ directory backed up"
    echo "  ✅ Vercel environment files: $(find "$BACKUP_DIR/$BACKUP_NAME/project/.vercel" -name ".env*" -type f | wc -l | tr -d ' ') files"
else
    echo "  ⚠️  Warning: .vercel/ directory not found in backup"
fi

# 2. Backup PostgreSQL databases
echo "🗄️ Backing up PostgreSQL databases..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Starting PostgreSQL..."
    brew services start postgresql@15
    sleep 5
fi

# Create database backup directory
mkdir -p "$BACKUP_DIR/$BACKUP_NAME/databases"

# Backup each database
echo "📊 Backing up tcc_center database..."
pg_dump -h localhost -U scooper -d tcc_center > "$BACKUP_DIR/$BACKUP_NAME/databases/tcc_center.sql"

echo "📊 Backing up tcc_hospital database..."
pg_dump -h localhost -U scooper -d tcc_hospital > "$BACKUP_DIR/$BACKUP_NAME/databases/tcc_hospital.sql"

echo "📊 Backing up tcc_ems database..."
pg_dump -h localhost -U scooper -d tcc_ems > "$BACKUP_DIR/$BACKUP_NAME/databases/tcc_ems.sql"

# 3. Create database restore script
echo "📝 Creating database restore script..."
cat > "$BACKUP_DIR/$BACKUP_NAME/restore-databases.sh" << 'EOF'
#!/bin/bash

# TCC Database Restore Script
# Restores PostgreSQL databases from backup

echo "🔄 Restoring TCC databases..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Starting PostgreSQL..."
    brew services start postgresql@15
    sleep 5
fi

# Create databases if they don't exist
echo "📊 Creating databases..."
createdb -h localhost -U scooper tcc_center 2>/dev/null || true
createdb -h localhost -U scooper tcc_hospital 2>/dev/null || true
createdb -h localhost -U scooper tcc_ems 2>/dev/null || true

# Restore databases
echo "📊 Restoring tcc_center database..."
psql -h localhost -U scooper -d tcc_center < databases/tcc_center.sql

echo "📊 Restoring tcc_hospital database..."
psql -h localhost -U scooper -d tcc_hospital < databases/tcc_hospital.sql

echo "📊 Restoring tcc_ems database..."
psql -h localhost -U scooper -d tcc_ems < databases/tcc_ems.sql

echo "✅ Database restoration completed!"
EOF

chmod +x "$BACKUP_DIR/$BACKUP_NAME/restore-databases.sh"

# 4. Create comprehensive restore script
echo "📝 Creating comprehensive restore script..."
cat > "$BACKUP_DIR/$BACKUP_NAME/restore-complete.sh" << 'EOF'
#!/bin/bash

# TCC Complete Restore Script
# Restores project and databases from backup

echo "🔄 Starting TCC complete restoration..."

# 1. Restore project files
echo "📦 Restoring project files..."
if [ -d "project" ]; then
    cp -r project/* /Users/scooper/Code/tcc-new-project/
    echo "✅ Project files restored"
else
    echo "❌ Project directory not found"
    exit 1
fi

# 2. Install dependencies
echo "📦 Installing dependencies..."
cd /Users/scooper/Code/tcc-new-project
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Restore databases
echo "🗄️ Restoring databases..."
./restore-databases.sh

# 4. Generate Prisma clients
echo "🔧 Generating Prisma clients..."
cd backend
npm run db:generate
cd ..

echo "✅ Complete restoration finished!"
echo "🚀 You can now run: npm run dev"
EOF

chmod +x "$BACKUP_DIR/$BACKUP_NAME/restore-complete.sh"

# 4.5. Create environment setup guide
echo "📝 Creating environment setup guide..."
cat > "$BACKUP_DIR/$BACKUP_NAME/ENVIRONMENT_SETUP.md" << 'EOF'
# TCC Environment Setup Guide

This backup includes all necessary environment files for dev/prod separation.

## Environment Files Included:

### Development Environment:
- `backend/.env` - Backend development configuration
- `frontend/.env.local` - Frontend local development settings

### Production Environment:
- `frontend/.env.production` - Frontend production configuration
- `.vercel/.env.preview.local` - Vercel preview environment variables

### Configuration Files:
- `vercel.json` - Root Vercel configuration (API rewrites)
- `frontend/vercel.json` - Frontend-specific Vercel configuration

## Database Configuration:

The backup uses the current TCC database schema:
- `tcc_center` - Main TCC admin database
- `tcc_hospital` - Healthcare facilities database
- `tcc_ems` - EMS agencies database

## Key Environment Variables:

### Backend (.env):
```
DATABASE_URL_CENTER="postgresql://scooper@localhost:5432/tcc_center?schema=public"
DATABASE_URL_EMS="postgresql://scooper@localhost:5432/tcc_ems?schema=public"
DATABASE_URL_HOSPITAL="postgresql://scooper@localhost:5432/tcc_hospital?schema=public"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=5001
NODE_ENV="development"
```

### Frontend Production (.env.production):
```
# VITE_API_BASE_URL and VITE_API_URL are commented out for same-origin configuration
# This enables the Vercel rewrite proxy for CORS-free API calls
```

## Vercel Configuration:

The backup includes the complete Vercel setup with:
- API rewrite rules for same-origin proxy
- Environment variables for preview deployments
- Project configuration files

## Restoration Process:

1. Run `./restore-complete.sh` for automatic restoration
2. Or manually:
   - Copy project files to your development directory
   - Run `./restore-databases.sh` to restore databases
   - Install dependencies: `npm install`
   - Generate Prisma clients: `cd backend && npm run db:generate`
   - Start development: `npm run dev`

## Dev/Prod Separation:

This backup maintains complete separation between development and production environments:
- Development uses local PostgreSQL databases
- Production uses Vercel serverless functions with same-origin proxy
- Environment variables are properly isolated
- CORS issues are resolved via Vercel rewrites

## Security Notes:

- JWT secrets are included for development only
- Production secrets should be updated before deployment
- Database passwords are using local PostgreSQL defaults
- Review all environment variables before production deployment
EOF

# 5. Create backup info file
echo "📝 Creating backup info..."
cat > "$BACKUP_DIR/$BACKUP_NAME/backup-info.txt" << EOF
TCC Project Enhanced Backup
===========================
Date: $(date)
Project: tcc-new-project
Phase: 3 Complete - Revenue Optimization & EMS Management
Status: Full CRUD functionality with optimization algorithms

Contents:
- Complete project files (source code, configs, docs)
- All environment files (.env, .env.production, etc.)
- Vercel configuration (.vercel/ directory)
- PostgreSQL database dumps (tcc_center, tcc_hospital, tcc_ems)
- Database restore scripts
- Complete restoration script

Environment Files Included:
✅ backend/.env - Backend development environment
✅ frontend/.env.production - Frontend production environment
✅ frontend/.env.local - Frontend local environment
✅ .vercel/.env.preview.local - Vercel preview environment
✅ All vercel.json configuration files

Databases Included:
✅ tcc_center.sql - Main TCC database
✅ tcc_hospital.sql - Hospital management database  
✅ tcc_ems.sql - EMS agencies database

Features Working:
✅ TCC Admin Dashboard (Hospitals, Agencies, Facilities)
✅ Healthcare Portal (Trip creation)
✅ EMS Dashboard (Trip management + Optimization)
✅ Revenue Optimization Engine
✅ Backhaul Detection System
✅ Complete CRUD operations
✅ Search and filtering
✅ Authentication system

To restore:
1. Run: ./restore-complete.sh
2. Or manually:
   - Copy project files to /Users/scooper/Code/tcc-new-project/
   - Run: ./restore-databases.sh
   - Install dependencies: npm install
   - Start: npm run dev

Database Backup Size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME/databases" | cut -f1)
Total Backup Size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)
EOF

echo "✅ Enhanced backup completed: $BACKUP_DIR/$BACKUP_NAME"
echo "📊 Project size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME/project" | cut -f1)"
echo "📊 Database size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME/databases" | cut -f1)"
echo "📊 Total size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)"
echo "📁 Backup location: $BACKUP_DIR/$BACKUP_NAME"
echo ""
echo "🔧 To restore: cd $BACKUP_DIR/$BACKUP_NAME && ./restore-complete.sh"
