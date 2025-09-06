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
      console.log('🔧 Production mode: Initializing database...');
      
      // Import execSync for running commands
      const { execSync } = require('child_process');
      
      try {
        // Push the production schema with retry
        console.log('📊 Pushing production schema...');
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            execSync('npx prisma db push --schema=prisma/schema-production.prisma', { 
              stdio: 'inherit',
              cwd: process.cwd(),
              timeout: 30000 // 30 second timeout
            });
            break; // Success, exit retry loop
          } catch (pushError) {
            retryCount++;
            console.log(`⚠️ Schema push attempt ${retryCount} failed:`, pushError instanceof Error ? pushError.message : String(pushError));
            
            if (retryCount < maxRetries) {
              console.log(`🔄 Retrying in 5 seconds... (${retryCount}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 5000));
            } else {
              throw pushError; // Re-throw if all retries failed
            }
          }
        }
        
        // Seed the database with retry
        console.log('🌱 Seeding database...');
        retryCount = 0;
        
        while (retryCount < maxRetries) {
          try {
            execSync('npx ts-node prisma/seed.ts', { 
              stdio: 'inherit',
              cwd: process.cwd(),
              timeout: 30000 // 30 second timeout
            });
            break; // Success, exit retry loop
          } catch (seedError) {
            retryCount++;
            console.log(`⚠️ Database seeding attempt ${retryCount} failed:`, seedError instanceof Error ? seedError.message : String(seedError));
            
            if (retryCount < maxRetries) {
              console.log(`🔄 Retrying in 5 seconds... (${retryCount}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 5000));
            } else {
              throw seedError; // Re-throw if all retries failed
            }
          }
        }
        
        console.log('✅ Database initialized successfully!');
      } catch (error) {
        console.log('⚠️ Database initialization failed, but continuing...', error instanceof Error ? error.message : String(error));
      }
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
