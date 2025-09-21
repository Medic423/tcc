# 🛡️ Dev Site Safety Rules

## **CRITICAL: Never Break the Dev Site Again**

### **🚨 Safety Rules (MANDATORY)**

1. **ALWAYS use production work safety mode before making changes**
   ```bash
   ./scripts/production-work.sh start
   ```

2. **NEVER make changes to frontend files without safety monitoring**
   - The dev site MUST be monitored during any production work
   - If dev site goes down, it will be automatically restarted

3. **ALWAYS create backups before major changes**
   - The safety script automatically creates backups
   - Manual backups: `./scripts/production-work.sh restore <backup_name>`

4. **STOP production work when done**
   ```bash
   ./scripts/production-work.sh stop
   ```

### **🔍 Monitoring System**

The dev site monitor:
- ✅ Checks dev site health every 10 seconds
- ✅ Automatically restarts if it goes down
- ✅ Logs all events to `dev-monitor.log`
- ✅ Alerts after 3 consecutive failures

### **📋 Pre-Production Checklist**

Before starting any production work:

- [ ] Dev site is running (`./scripts/production-work.sh status`)
- [ ] Safety monitoring is active (`./scripts/production-work.sh start`)
- [ ] Backup created automatically
- [ ] Monitor logs are being written

### **🚨 Emergency Procedures**

If dev site goes down during production work:

1. **Check monitor logs**: `tail -f dev-monitor.log`
2. **Check dev site status**: `./scripts/production-work.sh status`
3. **Restore from backup**: `./scripts/production-work.sh restore <backup_name>`
4. **Manual restart if needed**: `cd frontend && npm run dev`

### **📁 Backup System**

Backups are stored in `dev-backups/`:
- `src_backup_<timestamp>/` - Source code backup
- `package_backup_<timestamp>.json` - Package.json backup
- `vite_backup_<timestamp>.ts` - Vite config backup
- `tailwind_backup_<timestamp>.js` - Tailwind config backup
- `postcss_backup_<timestamp>.js` - PostCSS config backup

### **⚠️ What NOT to Do**

- ❌ Never edit frontend files without safety monitoring
- ❌ Never kill vite processes manually during production work
- ❌ Never make changes without checking dev site status first
- ❌ Never ignore dev site health warnings

### **✅ What TO Do**

- ✅ Always start with `./scripts/production-work.sh start`
- ✅ Check dev site status regularly
- ✅ Use the monitoring system
- ✅ Create manual backups for major changes
- ✅ Stop monitoring when done: `./scripts/production-work.sh stop`

## **🎯 Quick Commands**

```bash
# Start production work safely
./scripts/production-work.sh start

# Check dev site status
./scripts/production-work.sh status

# Stop production work
./scripts/production-work.sh stop

# Restore from backup
./scripts/production-work.sh restore <backup_name>

# Manual dev site restart
cd frontend && npm run dev
```

## **📞 Emergency Contacts**

If the dev site is broken and you can't fix it:
1. Check the backup directory for recent backups
2. Restore the most recent working backup
3. If that fails, restore from git: `git checkout HEAD~1 -- frontend/`
4. Restart dev site: `cd frontend && npm run dev`

---

**Remember: The dev site is sacred. Protect it at all costs! 🛡️**
