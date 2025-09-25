#!/bin/bash

# TCC Critical Scripts Backup to iCloud
# This script backs up essential scripts that maintain dev/prod separation
# Run this periodically to ensure you always have the latest versions

ICLOUD_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/TCC-Critical-Scripts"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$ICLOUD_DIR/backup-$TIMESTAMP"

echo "☁️  Starting critical scripts backup to iCloud..."
echo "Backup to: $BACKUP_DIR"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# 1. Backup enhanced backup script (latest version)
echo "📦 Backing up enhanced backup script..."
cp "/Users/scooper/Code/tcc-new-project/scripts/backup-enhanced-latest.sh" "$BACKUP_DIR/"

# 2. Backup development startup script
echo "📦 Backing up development startup script..."
if [ -f "/Users/scooper/Code/tcc-new-project/scripts/start-dev-complete.sh" ]; then
    cp "/Users/scooper/Code/tcc-new-project/scripts/start-dev-complete.sh" "$BACKUP_DIR/"
else
    echo "⚠️  start-dev-complete.sh not found"
fi

# 3. Backup any other critical scripts
echo "📦 Backing up other critical scripts..."
find "/Users/scooper/Code/tcc-new-project/scripts" -name "*.sh" -type f | while read script; do
    script_name=$(basename "$script")
    if [[ "$script_name" != "backup-enhanced-latest.sh" && "$script_name" != "backup-critical-scripts-to-icloud.sh" ]]; then
        echo "  ✅ Backing up $script_name"
        cp "$script" "$BACKUP_DIR/"
    fi
done

# 4. Create a manifest of what's included
echo "📝 Creating backup manifest..."
cat > "$BACKUP_DIR/MANIFEST.txt" << EOF
TCC Critical Scripts Backup
===========================
Date: $(date)
Backup ID: backup-$TIMESTAMP

Scripts Included:
$(ls -la "$BACKUP_DIR" | grep -E '\.(sh|txt)$' | awk '{print "✅ " $9 " (" $5 " bytes)"}')

Purpose:
These scripts maintain dev/prod separation and are essential for:
- Complete project backups (including environment files)
- Development environment startup
- Database management
- Environment configuration

Usage:
1. Download these scripts from iCloud
2. Make them executable: chmod +x *.sh
3. Use backup-enhanced-latest.sh for complete project backups
4. Use start-dev-complete.sh for development startup

Note:
These scripts are version-controlled separately from the main project
because they contain critical functionality that must be preserved
across project restorations.
EOF

# 5. Create a symlink to the latest backup
echo "🔗 Creating latest backup symlink..."
cd "$ICLOUD_DIR"
rm -f latest-backup
ln -s "backup-$TIMESTAMP" latest-backup

# 6. Create a quick reference guide
echo "📚 Creating quick reference guide..."
cat > "$ICLOUD_DIR/QUICK_REFERENCE.md" << 'EOF'
# TCC Critical Scripts - Quick Reference

## Essential Scripts:

### 1. `backup-enhanced-latest.sh`
- **Purpose**: Complete project backup with environment files
- **Usage**: `./backup-enhanced-latest.sh [backup-destination]`
- **Includes**: All .env files, Vercel config, databases, restore scripts
- **Critical**: Maintains dev/prod separation

### 2. `start-dev-complete.sh`
- **Purpose**: Start development environment safely
- **Usage**: `./start-dev-complete.sh`
- **Includes**: Health checks, clean restarts, service management

### 3. Other Scripts
- Various utility scripts for development and maintenance

## Recovery Process:

If you need to restore from an older backup:

1. **Download these scripts** from iCloud latest-backup folder
2. **Make executable**: `chmod +x *.sh`
3. **Run enhanced backup** to create new complete backup
4. **Restore project** using the enhanced backup's restore scripts

## Why This Matters:

- Git does NOT backup environment files (.env*)
- Git does NOT backup Vercel configuration (.vercel/)
- Without these scripts, you lose dev/prod separation
- These scripts are your safety net for complete restoration

## Maintenance:

Run `backup-critical-scripts-to-icloud.sh` periodically to keep these scripts updated in iCloud.
EOF

echo "✅ Critical scripts backup completed!"
echo "📁 Backup location: $BACKUP_DIR"
echo "🔗 Latest symlink: $ICLOUD_DIR/latest-backup"
echo "📚 Quick reference: $ICLOUD_DIR/QUICK_REFERENCE.md"
echo ""
echo "📊 Files backed up:"
ls -la "$BACKUP_DIR" | grep -E '\.(sh|txt|md)$' | awk '{print "  ✅ " $9}'
echo ""
echo "☁️  These files are now safely stored in iCloud and accessible from any device!"
