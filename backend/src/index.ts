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

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TCC Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`🏥 Hospitals API: http://localhost:${PORT}/api/tcc/hospitals`);
  console.log(`🚑 Agencies API: http://localhost:${PORT}/api/tcc/agencies`);
  console.log(`🏢 Facilities API: http://localhost:${PORT}/api/tcc/facilities`);
  console.log(`📈 Analytics API: http://localhost:${PORT}/api/tcc/analytics`);
});

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
