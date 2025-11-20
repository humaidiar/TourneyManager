# Deployment Guide - Badminton Tournament Manager

Complete guide for deploying the Badminton Tournament Manager to production.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Building for Production](#building-for-production)
- [Deployment Options](#deployment-options)
- [Replit Deployment](#replit-deployment)
- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- Node.js 20.x or higher
- PostgreSQL 14.x or higher
- npm 10.x or higher
- Git

### Accounts Needed

- GitHub account (for version control)
- Neon account (for database) OR self-hosted PostgreSQL
- Deployment platform account (Replit, Vercel, Heroku, etc.)

## Environment Setup

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Session
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Node Environment
NODE_ENV=production

# Optional: Port configuration
PORT=5000
```

### Production Environment Variables

**DATABASE_URL Format:**
```
postgresql://username:password@hostname:port/database?sslmode=require
```

**SESSION_SECRET:**
- Generate a secure random string
- Minimum 32 characters
- Use a password generator or:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

**Security Notes:**
- Never commit `.env` to version control
- Add `.env` to `.gitignore`
- Use different secrets for each environment
- Rotate secrets periodically

## Database Setup

### Option 1: Neon Database (Recommended)

1. **Create Neon Account**
   - Go to https://neon.tech
   - Sign up for free tier

2. **Create Database**
   - Click "Create Project"
   - Name your project (e.g., "badminton-manager")
   - Select region closest to your users
   - Copy connection string

3. **Configure Connection**
   - Add to `.env`:
     ```env
     DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
     ```

4. **Run Migrations**
   ```bash
   npm run db:push
   ```

### Option 2: Self-Hosted PostgreSQL

1. **Install PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # macOS (Homebrew)
   brew install postgresql
   brew services start postgresql
   ```

2. **Create Database**
   ```bash
   sudo -u postgres psql
   ```
   ```sql
   CREATE DATABASE badminton_manager;
   CREATE USER badminton_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE badminton_manager TO badminton_user;
   \q
   ```

3. **Configure Connection**
   ```env
   DATABASE_URL=postgresql://badminton_user:secure_password@localhost:5432/badminton_manager
   ```

4. **Run Migrations**
   ```bash
   npm run db:push
   ```

### Database Backup

**Automated Backups (Neon):**
- Included in Neon free tier
- Point-in-time recovery available
- Automatic snapshots

**Manual Backups:**
```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20251120.sql
```

## Building for Production

### 1. Install Dependencies

```bash
npm install --production=false
```

### 2. Build Frontend & Backend

```bash
npm run build
```

This creates:
- `dist/public/` - Frontend static files
- `dist/index.js` - Backend server bundle

### 3. Verify Build

```bash
# Check build output
ls -la dist/
ls -la dist/public/

# Test production build locally
NODE_ENV=production node dist/index.js
```

## Deployment Options

### Comparison Table

| Platform | Ease | Cost | Scalability | Database Included |
|----------|------|------|-------------|-------------------|
| Replit | ⭐⭐⭐⭐⭐ | Free-$20/mo | Medium | ✅ |
| Vercel | ⭐⭐⭐⭐ | Free-$20/mo | High | ❌ |
| Heroku | ⭐⭐⭐ | $7-$25/mo | High | ✅ |
| Railway | ⭐⭐⭐⭐ | $5-$20/mo | High | ✅ |
| Docker | ⭐⭐ | Variable | High | ❌ |
| VPS | ⭐ | $5-$50/mo | High | ❌ |

## Replit Deployment

### Using Replit (Current Setup)

**This application is already configured for Replit!**

### 1. Publish Your Repl

1. Click "Deploy" button in Replit
2. Select deployment configuration:
   - **Autoscale**: Automatically scales based on traffic
   - **Reserved VM**: Dedicated resources
   - **Static**: For frontend-only (not suitable for this app)

3. Configure domain:
   - Use default `.replit.app` domain
   - Or connect custom domain

4. Set environment variables:
   - Add `DATABASE_URL`
   - Add `SESSION_SECRET`
   - Keep `NODE_ENV=production`

5. Deploy!

### 2. Custom Domain Setup

1. In deployment settings, click "Add custom domain"
2. Enter your domain (e.g., `badminton.yourdomain.com`)
3. Add DNS records as instructed:
   ```
   Type: CNAME
   Name: badminton
   Value: your-repl-name.replit.app
   ```
4. Wait for DNS propagation (up to 48 hours)
5. SSL certificate auto-generates

### 3. Monitoring in Replit

- View logs in deployment dashboard
- Monitor resource usage
- Set up alerts for downtime

## Vercel Deployment

### Prerequisites

- Separate database (Neon, Supabase, etc.)
- Vercel account

### 1. Prepare for Vercel

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "dist/public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "dist/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "dist/public/$1"
    }
  ]
}
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 3. Configure Environment

In Vercel dashboard:
1. Go to project settings
2. Add environment variables:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `NODE_ENV=production`
3. Redeploy

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy application
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "dist/index.js"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=badminton_manager
      - POSTGRES_USER=badminton_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### 3. Deploy with Docker

```bash
# Build image
docker-compose build

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Post-Deployment

### 1. Verify Deployment

**Health Checks:**

```bash
# Check server is running
curl https://your-domain.com/api/sessions

# Should return: []

# Create test session
curl -X POST https://your-domain.com/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Session"}'
```

### 2. Database Verification

```bash
# Open Drizzle Studio (development only)
npm run db:studio

# Or connect with psql
psql $DATABASE_URL
```

```sql
-- Verify tables exist
\dt

-- Check sessions
SELECT * FROM sessions;

-- Check players
SELECT * FROM players;
```

### 3. Performance Testing

```bash
# Install Apache Bench
# Ubuntu
sudo apt install apache2-utils

# Test load
ab -n 1000 -c 10 https://your-domain.com/
```

### 4. SSL/HTTPS Setup

**Replit/Vercel:**
- SSL automatically configured
- Certificate auto-renews

**Custom Server:**
```bash
# Using Certbot (Let's Encrypt)
sudo certbot --nginx -d your-domain.com
```

## Monitoring

### Application Monitoring

**Logging:**

```typescript
// Add in server/index.ts
import morgan from 'morgan';

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
}
```

**Error Tracking:**

Consider adding Sentry:

```bash
npm install @sentry/node
```

```typescript
// server/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.errorHandler());
```

### Database Monitoring

**Neon Dashboard:**
- Query performance
- Connection pooling stats
- Storage usage

**Custom Queries:**

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Uptime Monitoring

**Free Tools:**
- UptimeRobot: https://uptimerobot.com
- Pingdom: https://pingdom.com
- StatusCake: https://statuscake.com

**Setup:**
1. Create account
2. Add monitor for your domain
3. Set check interval (5-15 minutes)
4. Configure alerts (email, SMS)

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Error:** `ECONNREFUSED` or `Connection timeout`

**Solutions:**
```bash
# Verify DATABASE_URL format
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check SSL mode
# Should include ?sslmode=require for cloud databases

# Verify firewall rules allow your server IP
```

#### 2. Build Failures

**Error:** TypeScript compilation errors

**Solutions:**
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build

# Check TypeScript version
npx tsc --version

# Verify tsconfig.json is correct
```

#### 3. Port Already in Use

**Error:** `EADDRINUSE: address already in use`

**Solutions:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3000 npm start
```

#### 4. Environment Variables Not Loading

**Error:** `DATABASE_URL is not defined`

**Solutions:**
```bash
# Verify .env exists
ls -la .env

# Check file contents (don't expose secrets!)
cat .env | grep DATABASE_URL

# Load manually for testing
export DATABASE_URL="your-connection-string"
npm start
```

#### 5. Frontend Not Loading

**Error:** Blank page or 404 errors

**Solutions:**
```bash
# Verify build output exists
ls dist/public/

# Check Vite build
npm run build

# Verify static file serving in server
# Check server/index.ts serves from dist/public
```

### Performance Issues

**Slow Queries:**

```sql
-- Enable query logging
ALTER DATABASE badminton_manager SET log_min_duration_statement = 1000;

-- View slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**High Memory Usage:**

```bash
# Monitor memory
free -h
top

# Check Node.js memory
node --max-old-space-size=512 dist/index.js
```

### Logs and Debugging

**View Application Logs:**

```bash
# Replit
# Built-in logs viewer in deployment dashboard

# Docker
docker-compose logs -f app

# PM2
pm2 logs

# Direct
node dist/index.js 2>&1 | tee app.log
```

**Database Logs:**

```bash
# Neon: View in dashboard

# Self-hosted PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## Scaling Considerations

### Horizontal Scaling

**Load Balancer Setup:**

```nginx
# Nginx configuration
upstream badminton_app {
  server localhost:5001;
  server localhost:5002;
  server localhost:5003;
}

server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://badminton_app;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

### Database Scaling

**Connection Pooling:**

Already configured in Drizzle:

```typescript
// server/db.ts
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!, {
  poolQueryViaFetch: true,
});
```

**Read Replicas:**

For high traffic:
1. Set up read replica in Neon
2. Route read queries to replica
3. Write queries to primary

### Caching

**Add Redis for sessions:**

```bash
npm install redis connect-redis
```

```typescript
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL
});

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
}));
```

## Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured
- [ ] Session secret rotated
- [ ] Database password strong
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (using Drizzle ORM)
- [ ] XSS protection (React escaping)
- [ ] Security headers configured
- [ ] Database backups automated
- [ ] Error messages don't expose internals
- [ ] Dependencies up to date

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Monitor performance metrics
- Review database size

**Monthly:**
- Update dependencies
  ```bash
  npm outdated
  npm update
  ```
- Rotate session secrets
- Review database backups
- Check SSL certificate expiry

**Quarterly:**
- Security audit
- Performance optimization
- Database cleanup (old sessions)
- Update Node.js version

### Backup Strategy

**Automated:**
```bash
# Cron job for daily backups
0 2 * * * pg_dump $DATABASE_URL > /backups/db-$(date +\%Y\%m\%d).sql
```

**Retention Policy:**
- Daily backups: Keep 7 days
- Weekly backups: Keep 4 weeks
- Monthly backups: Keep 12 months

---

Your Badminton Tournament Manager is now deployed! 🎉

For questions or issues, consult:
- [User Guide](./USER_GUIDE.md)
- [Technical Documentation](./TECHNICAL.md)
- [API Documentation](./API.md)
