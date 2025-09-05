#!/bin/bash

# TCC Project Backup Script
# Backs up the project to external drive

PROJECT_DIR="/Users/scooper/Code/tcc-new-project"
BACKUP_DIR="/Volumes/Extreme SSD Two 2TB/tcc-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="tcc-backup-$TIMESTAMP"

echo "🔄 Starting TCC project backup..."
echo "Project: $PROJECT_DIR"
echo "Backup to: $BACKUP_DIR/$BACKUP_NAME"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
echo "📦 Creating backup..."
cp -r "$PROJECT_DIR" "$BACKUP_DIR/$BACKUP_NAME"

# Remove node_modules to save space
echo "🧹 Cleaning up node_modules..."
rm -rf "$BACKUP_DIR/$BACKUP_NAME/backend/node_modules"
rm -rf "$BACKUP_DIR/$BACKUP_NAME/frontend/node_modules"

# Create backup info file
echo "📝 Creating backup info..."
cat > "$BACKUP_DIR/$BACKUP_NAME/backup-info.txt" << EOF
TCC Project Backup
==================
Date: $(date)
Project: tcc-new-project
Phase: 1 Complete
Status: Admin dashboard with 3 siloed databases

Contents:
- Complete backend API (Node.js + Express + TypeScript)
- Complete frontend dashboard (React + TypeScript)
- 3 PostgreSQL database schemas
- Documentation and setup scripts
- Git repository with initial commit

To restore:
1. Copy this folder to your development machine
2. Run: cd backend && npm install
3. Run: cd frontend && npm install
4. Run: ./setup.sh
EOF

echo "✅ Backup completed: $BACKUP_DIR/$BACKUP_NAME"
echo "📊 Backup size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)"
echo "📁 Backup location: $BACKUP_DIR/$BACKUP_NAME"
