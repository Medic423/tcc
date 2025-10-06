# TCC Backup Strategy & Recovery Guide

## **The Problem You Identified**

You correctly identified that **Git does NOT maintain critical files** needed for complete project restoration:

### **❌ What Git DOESN'T Backup:**
- Environment files (`.env*`) - These are in `.gitignore`
- Vercel configuration (`.vercel/` directory)
- Local database states
- Node modules (intentionally excluded)
- Local development configurations

### **✅ What Git DOES Backup:**
- Source code
- Configuration files (that aren't environment-specific)
- Documentation
- Package.json files

## **The Solution: Multi-Layer Backup Strategy**

### **Layer 1: Enhanced External Backup**
- **Script**: `scripts/backup-enhanced-latest.sh`
- **Purpose**: Wrapper that invokes root `backup-enhanced.sh` to create a complete project backup including ALL environment files
- **Location**: External drive (`/Volumes/Acasis/`)
- **Includes**: Environment files, Vercel config, databases, restore scripts

### **Layer 2: Critical Scripts Backup**
- **Script**: `scripts/backup-critical-scripts-to-icloud.sh`
- **Purpose**: Backup the backup scripts themselves to iCloud
- **Location**: iCloud Drive
- **Why**: If you restore from an older backup, you get old backup scripts

### **Layer 3: Git Repository**
- **Purpose**: Source code version control
- **Limitation**: Missing environment files and configurations

## **Recovery Scenarios**

### **Scenario 1: Complete System Loss**
1. **Download critical scripts** from iCloud
2. **Make executable**: `chmod +x *.sh`
3. **Run enhanced backup** to create fresh complete backup
4. **Restore project** using enhanced backup's restore scripts

### **Scenario 2: Restore from Older Backup**
1. **Problem**: Older backup has old backup script (no environment files)
2. **Solution**: Download latest scripts from iCloud first
3. **Then**: Use latest enhanced backup script to create new complete backup
4. **Finally**: Restore using the new complete backup

### **Scenario 3: Development Environment Rebuild**
1. **Use**: `scripts/start-dev-complete.sh` for safe startup
2. **Verify**: All services are healthy
3. **Test**: All three login systems work

## **Critical Files That Must Be Preserved**

### **Environment Files:**
```
backend/.env                    # Backend development config
frontend/.env.production        # Frontend production config
frontend/.env.local            # Frontend local config
.vercel/.env.preview.local     # Vercel preview config
```

### **Configuration Files:**
```
vercel.json                    # Root Vercel config (API rewrites)
frontend/vercel.json          # Frontend Vercel config
.vercel/                      # Complete Vercel directory
```

### **Database Schemas:**
```
tcc_center                     # Main TCC database
tcc_hospital                   # Healthcare database
tcc_ems                       # EMS database
```

## **Maintenance Schedule**

### **Daily (Development):**
- Use `scripts/start-dev-complete.sh` for safe startup
- Verify all login systems work

### **Weekly:**
- Run `scripts/backup-enhanced-latest.sh` for complete backup
- Run `scripts/backup-critical-scripts-to-icloud.sh` to update iCloud

### **Before Major Changes:**
- Always create enhanced backup before significant modifications
- Update critical scripts in iCloud if you modify them

### **After Git Operations:**
- Remember: Git restore won't include environment files
- Always verify environment files are intact after Git operations

## **Your Strategic Insight**

Your observation was **absolutely correct**:

> "If you restored from a backup older than this one you would get a version that doesn't maintain separation correct."

This is exactly why we need:
1. **Version-controlled backup scripts** in iCloud
2. **Enhanced backup script** that includes environment files
3. **Separate storage** for critical scripts outside the main project

## **Quick Commands**

### **Create Complete Backup:**
```bash
./scripts/backup-enhanced-latest.sh
```

### **Update Critical Scripts in iCloud:**
```bash
./scripts/backup-critical-scripts-to-icloud.sh
```

### **Run Both Backups Together:**
```bash
./scripts/backup-run-all.sh /Volumes/Acasis/
```

### **Restore from Backup:**
```bash
cd /path/to/backup
./restore-complete.sh
```

### **Isolated Restore (Dry Run) Procedure**
Restore to a separate temp directory and a non-production DB namespace to validate backups without touching your live environment.

1) Prepare temp directory
```bash
RESTORE_ROOT="/Volumes/Acasis/tcc-backups/<backup-folder>"
TEST_DIR="/tmp/tcc-restore-test"
rm -rf "$TEST_DIR" && mkdir -p "$TEST_DIR"
cp -r "$RESTORE_ROOT/project" "$TEST_DIR/"
```

2) Optional: validate scripts from the restored copy
```bash
pushd "$TEST_DIR/project" >/dev/null
./scripts/check-backend-health.sh || true
./scripts/check-frontend-errors.sh || true
popd >/dev/null
```

3) Optional: isolated DB import (use a separate DB name or Docker)
- Recommended: import `databases/medport_ems.sql` into a disposable local DB (e.g., `tcc_ems_test`) or a Docker Postgres container.
- Do not run restore scripts against your live DBs.

4) Optional: run services from the restored copy
```bash
pushd "$TEST_DIR/project" >/dev/null
# Set env vars to point to the isolated DB (e.g., *_TEST URLs)
# Then start backend/frontend in different ports if needed.
popd >/dev/null
```

5) Cleanup
```bash
rm -rf "$TEST_DIR"
```

Add this dry run to the weekly routine before major merges/releases.

### **Docker Postgres Snapshot DB (Keep in Sync)**
Maintain a local Docker Postgres with a restorable snapshot of the latest backup for safe testing.

1) Start Docker Postgres (one-time)
```bash
docker run --name tcc-pg-test \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=tcc_ems_test \
  -p 5544:5432 -d postgres:16-alpine
```

2) Import the latest DB from a backup folder
```bash
RESTORE_ROOT="/Volumes/Acasis/tcc-backups/<backup-folder>"
docker cp "$RESTORE_ROOT/databases/medport_ems.sql" tcc-pg-test:/tmp/medport_ems.sql
docker exec -i tcc-pg-test \
  psql -U postgres -d tcc_ems_test -f /tmp/medport_ems.sql
```

3) Verify
```bash
docker exec -i tcc-pg-test psql -U postgres -d tcc_ems_test -c "SELECT count(*) FROM transport_requests;"
```

4) Update the Docker DB when a new backup is created
```bash
# Option A: Re-import over the same DB (fast for small DBs)
docker cp "/Volumes/Acasis/tcc-backups/<new-backup>/databases/medport_ems.sql" tcc-pg-test:/tmp/medport_ems.sql
docker exec -i tcc-pg-test psql -U postgres -d tcc_ems_test -f /tmp/medport_ems.sql

# Option B: Recreate the DB (ensures a clean state)
docker exec -i tcc-pg-test psql -U postgres -c "DROP DATABASE IF EXISTS tcc_ems_test;"
docker exec -i tcc-pg-test psql -U postgres -c "CREATE DATABASE tcc_ems_test;"
docker exec -i tcc-pg-test psql -U postgres -d tcc_ems_test -f /tmp/medport_ems.sql
```

5) Point a local app instance at Docker DB (optional)
```bash
# Example .env override for backend
DATABASE_URL=postgresql://postgres:postgres@localhost:5544/tcc_ems_test?schema=public
```

6) Stop/Start the container
```bash
docker stop tcc-pg-test
docker start tcc-pg-test
```

### **Safe Development Startup:**
```bash
./scripts/start-dev-complete.sh
```

## **Emergency Recovery Checklist**

1. ✅ Download critical scripts from iCloud
2. ✅ Make scripts executable
3. ✅ Create fresh enhanced backup
4. ✅ Restore project using enhanced backup
5. ✅ Verify all login systems work
6. ✅ Test dev/prod separation

## **Why This Strategy Works**

- **Git**: Handles source code versioning
- **Enhanced Backup**: Handles environment files and configurations
- **iCloud Scripts**: Ensures you always have latest backup capabilities
- **External Drive**: Provides complete offline backup capability
- **Multiple Layers**: Redundancy prevents total loss

Your strategic thinking about this backup architecture was spot-on! 🎯
