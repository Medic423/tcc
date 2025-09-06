import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { databaseManager } from './services/databaseManager';

// Import routes
import authRoutes from './routes/auth';
import hospitalRoutes from './routes/hospitals';
import agencyRoutes from './routes/agencies';
import facilityRoutes from './routes/facilities';
import analyticsRoutes from './routes/analytics';
import tripRoutes from './routes/trips';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TCC Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const isHealthy = await databaseManager.healthCheck();
    
    if (isHealthy) {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        databases: 'connected'
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        databases: 'disconnected'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/tcc/hospitals', hospitalRoutes);
app.use('/api/tcc/agencies', agencyRoutes);
app.use('/api/tcc/facilities', facilityRoutes);
app.use('/api/tcc/analytics', analyticsRoutes);

// Test endpoints
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await databaseManager.getPrismaClient().$queryRaw`SELECT version() as version, now() as current_time`;
    res.json({
      success: true,
      message: 'Database connection successful',
      data: result
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error),
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Check if we're in production and need to initialize the database
    if (process.env.NODE_ENV === 'production') {
      console.log('🔧 Production mode: Attempting database initialization...');
      
      // Import execSync for running commands
      const { execSync } = require('child_process');
      
      // Try to initialize database in background, don't block server startup
      setTimeout(async () => {
        try {
          console.log('📊 Attempting to push production schema...');
          execSync('npx prisma db push --schema=prisma/schema-production.prisma', { 
            stdio: 'inherit',
            cwd: process.cwd(),
            timeout: 60000 // 60 second timeout
          });
          
          console.log('🌱 Attempting to seed database...');
          execSync('npx ts-node prisma/seed.ts', { 
            stdio: 'inherit',
            cwd: process.cwd(),
            timeout: 60000 // 60 second timeout
          });
          
          console.log('✅ Database initialized successfully!');
        } catch (error) {
          console.log('⚠️ Database initialization failed (will retry on next deployment):', error instanceof Error ? error.message : String(error));
        }
      }, 10000); // Wait 10 seconds before attempting database init
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 TCC Backend server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
      console.log(`🚗 Trips API: http://localhost:${PORT}/api/trips`);
      console.log(`🏥 Hospitals API: http://localhost:${PORT}/api/tcc/hospitals`);
      console.log(`🚑 Agencies API: http://localhost:${PORT}/api/tcc/agencies`);
      console.log(`🏢 Facilities API: http://localhost:${PORT}/api/tcc/facilities`);
      console.log(`📈 Analytics API: http://localhost:${PORT}/api/tcc/analytics`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await databaseManager.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await databaseManager.disconnect();
  process.exit(0);
});

export default app;
