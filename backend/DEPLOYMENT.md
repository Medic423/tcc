# TCC Backend Deployment Guide

## Development Environment

The development environment uses siloed databases and is configured for local development.

### Setup Development
```bash
# Install dependencies
npm install

# Generate Prisma client for development
npm run db:generate

# Start development server
npm run dev
```

### Development Configuration
- **Database**: Uses siloed databases (center, ems, hospital)
- **Schema**: `prisma/schema.prisma` (uses `DATABASE_URL_CENTER`)
- **Environment**: `.env` file with siloed database URLs
- **Port**: 5001

## Production Environment (Render)

The production environment uses a unified database schema for Render deployment.

### Setup Production
```bash
# Install dependencies
npm install

# Generate Prisma client for production
npm run db:generate:prod

# Build for production
npm run build:prod

# Start production server
npm start
```

### Production Configuration
- **Database**: Uses unified database
- **Schema**: `prisma/schema-production.prisma` (uses `DATABASE_URL`)
- **Environment**: Set `DATABASE_URL` in Render dashboard
- **Build Command**: `npm run build:prod`

## Render Deployment

1. **Set Environment Variables in Render Dashboard:**
   - `DATABASE_URL`: Your PostgreSQL database URL
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: `production`

2. **Build Command:** `npm run build:prod`

3. **Start Command:** `npm start`

## Key Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| Database | Siloed (3 databases) | Unified (1 database) |
| Schema File | `schema.prisma` | `schema-production.prisma` |
| Build Command | `npm run build` | `npm run build:prod` |
| Prisma Generate | `npm run db:generate` | `npm run db:generate:prod` |
| Environment | `.env` | Render env vars |

## Important Notes

- **Development and production are completely separate**
- **Never change the development schema for production fixes**
- **Use production-specific commands for Render deployment**
- **Development environment remains unaffected by production changes**
