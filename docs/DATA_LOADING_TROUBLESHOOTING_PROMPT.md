# Data Loading Troubleshooting Prompt
**Date**: October 9, 2025  
**For**: New chat session to fix data loading issues

---

## 🎯 **CONTEXT**

The TCC system has been successfully deployed to Vercel production:
- ✅ **Frontend**: https://traccems.com (working)
- ✅ **Backend**: https://backend-7gq6yna1p-chuck-ferrells-projects.vercel.app (working)
- ✅ **Database**: Vercel Postgres (connected)
- ✅ **Authentication**: All user types can login successfully

**REMAINING ISSUE**: Data loading errors (500 errors from backend endpoints)

---

## 🔍 **SPECIFIC PROBLEM**

### **Console Errors:**
```
Healthcare Portal:
- /api/dropdown-options/* → 500 "Failed to get dropdown options"
- /api/tcc/facilities → 500 "Failed to retrieve facilities"
- /api/trips → 400 errors

EMS Portal:
- /api/trips → JSON parsing errors (likely 500 returning HTML)
```

### **User Experience:**
- Users can login successfully
- Dropdown options fail to load: "Failed to load options"
- Trip data fails to load
- Dashboard shows empty/error states

---

## 🎯 **ROOT CAUSE ANALYSIS**

### **Likely Issues:**
1. **Missing Database Tables**: Backend routes reference tables that don't exist in Vercel Postgres
2. **Prisma Schema Mismatch**: Schema expects models that aren't in the actual database
3. **Database Model References**: Routes using wrong database manager methods

### **Key Files to Check:**
- `backend/src/routes/dropdownOptions.ts` - References `dropdownOption` model
- `backend/src/routes/facilities.ts` - References facility models
- `backend/prisma/schema.prisma` - Check what models exist
- Vercel Postgres database - Check actual table structure

---

## 🚨 **CRITICAL WARNING**

**DO NOT MODIFY PRISMA SCHEMA WITHOUT EXTREME CAUTION**
- Previous attempt to add models caused network errors in development
- Always test changes in development first
- Consider creating missing tables directly in database instead of schema changes

---

## 📋 **RECOMMENDED APPROACH**

### **Step 1: Database Investigation**
```bash
# Check what tables actually exist in Vercel Postgres
DATABASE_URL="postgres://83b6f3a648992f0d604de269444988ad1248aa92f5ea7b85b794af2bc447f869:sk_53MYkpIqmD_l7bf7ex3lw@db.prisma.io:5432/postgres?sslmode=require" npx prisma db pull --print
```

### **Step 2: Route Analysis**
- Check `dropdownOptions.ts` - what database calls is it making?
- Check `facilities.ts` - what models does it reference?
- Verify database manager methods exist

### **Step 3: Safe Table Creation**
- If tables are missing, create them directly in database
- Don't modify Prisma schema unless absolutely necessary
- Test each change incrementally

---

## 🧪 **TEST CREDENTIALS**

```
Healthcare: test@hospital.com / testpassword
EMS:        test@ems.com / testpassword
TCC Admin:  admin@tcc.com / admin123
```

---

## 📊 **SUCCESS CRITERIA**

### **Fixed When:**
- ✅ Dropdown options load without "Failed to load options" error
- ✅ Trip data loads successfully
- ✅ Healthcare dashboard shows populated dropdowns
- ✅ EMS dashboard shows trip data
- ✅ No 500 errors in console logs

---

## 🔧 **TECHNICAL NOTES**

### **Backend Architecture:**
- Uses consolidated single database (`medport_ems`)
- All routes use `databaseManager.getCenterDB()`
- Authentication working (JWT tokens valid)

### **Frontend Architecture:**
- Uses configured `api` instance (not direct fetch calls)
- Properly points to backend URL
- Authentication headers included

### **Environment Separation:**
- Development: `localhost:3000` → `localhost:5001` → local PostgreSQL
- Production: `traccems.com` → Vercel backend → Vercel Postgres
- Keep environments separate during troubleshooting

---

## 🎯 **GOAL**

Fix the data loading issues so users can:
1. Login successfully ✅ (already working)
2. See dropdown options in Hospital Settings
3. View and manage trip data
4. Use all dashboard features

**Focus on the missing database tables/endpoints causing 500 errors.**
