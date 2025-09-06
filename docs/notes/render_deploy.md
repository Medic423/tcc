# 🚀 **RENDER DEPLOYMENT GUIDE**

## 📋 **OVERVIEW**

This guide covers deploying the TCC (Transport Control Center) application to Render for production use. The deployment includes both frontend and backend services with PostgreSQL databases.

## 🎯 **DEPLOYMENT TIMING**

**Recommended**: Deploy after **Phase 2 completion** (95% complete as of now)
- ✅ Core functionality is stable and working
- ✅ Real-world testing environment available
- ✅ Stakeholder demos possible
- ✅ Database performance validation ready

## 🏗️ **SERVICES TO DEPLOY**

### **1. Backend Service (Node.js + Express)**
- **Type**: Web Service
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm start`
- **Environment**: Node.js 18+

### **2. Frontend Service (React + Vite)**
- **Type**: Static Site
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`
- **Environment**: Node.js 18+

### **3. PostgreSQL Databases (3 separate databases)**
- **Hospital Database**: For hospital users and transport requests
- **EMS Database**: For EMS agencies and units
- **Center Database**: For system administration and analytics

## 🔧 **PRE-DEPLOYMENT CHECKLIST**

### **Backend Preparation**
- [ ] Update `package.json` with production start script
- [ ] Configure environment variables
- [ ] Ensure all dependencies are in `package.json`
- [ ] Test production build locally
- [ ] Configure CORS for production domain

### **Frontend Preparation**
- [ ] Update API base URL for production
- [ ] Configure environment variables
- [ ] Test production build locally
- [ ] Ensure all assets are properly referenced

### **Database Preparation**
- [ ] Create database schemas
- [ ] Run Prisma migrations
- [ ] Seed initial data
- [ ] Configure connection strings

## 📝 **ENVIRONMENT VARIABLES**

### **Backend Environment Variables**
```bash
# Database URLs
HOSPITAL_DATABASE_URL=postgresql://username:password@host:port/hospital_db
EMS_DATABASE_URL=postgresql://username:password@host:port/ems_db
CENTER_DATABASE_URL=postgresql://username:password@host:port/center_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5001
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.onrender.com

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### **Frontend Environment Variables**
```bash
# API Configuration
VITE_API_BASE_URL=https://your-backend-domain.onrender.com
VITE_APP_NAME=TCC Transport Control Center
VITE_APP_VERSION=1.0.0
```

## 🗄️ **DATABASE SETUP**

### **1. Create PostgreSQL Databases**
```sql
-- Create three separate databases
CREATE DATABASE tcc_hospital;
CREATE DATABASE tcc_ems;
CREATE DATABASE tcc_center;
```

### **2. Run Prisma Migrations**
```bash
# For each database
npx prisma migrate deploy --schema=prisma/schema-hospital.prisma
npx prisma migrate deploy --schema=prisma/schema-ems.prisma
npx prisma migrate deploy --schema=prisma/schema-center.prisma
```

### **3. Seed Initial Data**
```bash
# Run seed scripts
npm run seed:hospital
npm run seed:ems
npm run seed:center
```

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Create Render Account**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub account
3. Connect your repository

### **Step 2: Deploy Backend Service**
1. **New Web Service**
2. **Connect Repository**: Select your TCC repository
3. **Configuration**:
   - **Name**: `tcc-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **Environment Variables**: Add all backend variables
5. **Deploy**

### **Step 3: Deploy Frontend Service**
1. **New Static Site**
2. **Connect Repository**: Select your TCC repository
3. **Configuration**:
   - **Name**: `tcc-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Environment Variables**: Add all frontend variables
5. **Deploy**

### **Step 4: Create PostgreSQL Databases**
1. **New PostgreSQL**
2. **Create three separate databases**:
   - `tcc-hospital-db`
   - `tcc-ems-db`
   - `tcc-center-db`
3. **Note the connection strings** for each database

### **Step 5: Configure Database Connections**
1. Update backend environment variables with actual database URLs
2. Redeploy backend service
3. Run database migrations
4. Seed initial data

## 🔍 **POST-DEPLOYMENT VERIFICATION**

### **Backend Health Checks**
- [ ] Health endpoint: `https://your-backend.onrender.com/health`
- [ ] API endpoints responding correctly
- [ ] Database connections working
- [ ] Authentication working

### **Frontend Verification**
- [ ] Frontend loads without errors
- [ ] API calls to backend working
- [ ] Authentication flow working
- [ ] All pages accessible

### **Database Verification**
- [ ] All three databases accessible
- [ ] Tables created correctly
- [ ] Initial data seeded
- [ ] CRUD operations working

## 🛠️ **TROUBLESHOOTING**

### **Common Issues**

#### **Build Failures**
- Check Node.js version compatibility
- Verify all dependencies in `package.json`
- Check build commands are correct

#### **Database Connection Issues**
- Verify database URLs are correct
- Check database credentials
- Ensure databases are accessible from Render

#### **CORS Issues**
- Update `FRONTEND_URL` environment variable
- Check CORS configuration in backend
- Verify frontend URL is correct

#### **Environment Variable Issues**
- Ensure all required variables are set
- Check variable names match code
- Verify no typos in values

### **Debugging Commands**
```bash
# Check backend logs
render logs --service tcc-backend

# Check frontend logs
render logs --service tcc-frontend

# Check database logs
render logs --service tcc-hospital-db
```

## 📊 **MONITORING & MAINTENANCE**

### **Health Monitoring**
- Set up health check endpoints
- Monitor response times
- Track error rates
- Monitor database performance

### **Log Management**
- Review application logs regularly
- Set up log aggregation
- Monitor for errors and warnings
- Track user activity

### **Database Maintenance**
- Regular backups
- Monitor database size
- Optimize queries
- Update indexes as needed

## 🔒 **SECURITY CONSIDERATIONS**

### **Environment Variables**
- Use strong, unique passwords
- Rotate JWT secrets regularly
- Never commit secrets to repository
- Use Render's secure environment variable storage

### **Database Security**
- Use strong database passwords
- Enable SSL connections
- Restrict database access
- Regular security updates

### **Application Security**
- Enable HTTPS
- Implement rate limiting
- Validate all inputs
- Regular security audits

## 📈 **SCALING CONSIDERATIONS**

### **Backend Scaling**
- Monitor CPU and memory usage
- Scale up service as needed
- Consider horizontal scaling
- Implement caching strategies

### **Database Scaling**
- Monitor database performance
- Consider read replicas
- Implement connection pooling
- Plan for data growth

## 🎯 **SUCCESS CRITERIA**

### **Deployment Complete When:**
- [ ] All services deployed and running
- [ ] All databases accessible and populated
- [ ] Frontend loads without errors
- [ ] Backend API responding correctly
- [ ] Authentication working end-to-end
- [ ] Trip creation and management working
- [ ] All CRUD operations functional
- [ ] Health checks passing
- [ ] No critical errors in logs

## 📞 **SUPPORT & RESOURCES**

### **Render Documentation**
- [Render Docs](https://render.com/docs)
- [PostgreSQL on Render](https://render.com/docs/databases/postgresql)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)

### **TCC Project Resources**
- [Project Documentation](../README.md)
- [API Documentation](../backend/README.md)
- [Frontend Documentation](../frontend/README.md)

---

## 🚀 **READY TO DEPLOY!**

With Phase 2 at 95% completion, you're ready to deploy to Render. This will provide a production environment for testing, stakeholder demos, and continued development of Phase 3 features.

**Next Steps:**
1. Complete the remaining 5% of Phase 2 (email notifications)
2. Follow this deployment guide
3. Begin Phase 3 development with production environment
