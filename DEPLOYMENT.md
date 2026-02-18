# 🚀 AI BATTLE ARENA - Deployment Guide

**Quick Deploy:** Docker, systemd, or manual setup

---

## 📦 Method 1: Docker (Recommended)

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Create data directory
RUN mkdir -p data

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD wget --quiet --tries=1 --spider http://localhost:3001/api/agents || exit 1

# Start server
CMD ["node", "server/server.js"]
```

### Build & Run

```bash
# Build image
docker build -t ai-battle-arena .

# Run container
docker run -d \\
  --name ai-arena \\
  -p 3001:3001 \\
  -v $(pwd)/data:/app/data \\
  -e OPENCLAW_GATEWAY_URL=http://host.docker.internal:18789 \\
  -e OPENCLAW_GATEWAY_TOKEN=your_token \\
  --restart unless-stopped \\
  ai-battle-arena

# View logs
docker logs -f ai-arena

# Stop
docker stop ai-arena
```

### Docker Compose

```yaml
version: '3.8'

services:
  arena:
    build: .
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
    environment:
      - OPENCLAW_GATEWAY_URL=http://host.docker.internal:18789
      - OPENCLAW_GATEWAY_TOKEN=${OPENCLAW_GATEWAY_TOKEN}
      - PORT=3001
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/api/agents"]
      interval: 30s
      timeout: 3s
      retries: 3
```

Run:
```bash
docker-compose up -d
```

---

## ⚙️ Method 2: systemd Service (Linux)

### Service File

Create `/etc/systemd/system/ai-arena.service`:

```ini
[Unit]
Description=AI Battle Arena Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/ai-battle-arena
Environment="NODE_ENV=production"
Environment="PORT=3001"
EnvironmentFile=/path/to/ai-battle-arena/.env
ExecStart=/usr/bin/node server/server.js
Restart=on-failure
RestartSec=10
StandardOutput=append:/var/log/ai-arena/output.log
StandardError=append:/var/log/ai-arena/error.log

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/path/to/ai-battle-arena/data

[Install]
WantedBy=multi-user.target
```

### Setup

```bash
# Create log directory
sudo mkdir -p /var/log/ai-arena
sudo chown your-user:your-user /var/log/ai-arena

# Enable service
sudo systemctl daemon-reload
sudo systemctl enable ai-arena
sudo systemctl start ai-arena

# Check status
sudo systemctl status ai-arena

# View logs
journalctl -u ai-arena -f

# Restart
sudo systemctl restart ai-arena
```

---

## 🔧 Method 3: PM2 (Process Manager)

### Install PM2

```bash
npm install -g pm2
```

### Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'ai-arena',
    script: './server/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

### Commands

```bash
# Start
pm2 start ecosystem.config.js

# Status
pm2 status

# Logs
pm2 logs ai-arena

# Restart
pm2 restart ai-arena

# Stop
pm2 stop ai-arena

# Auto-start on boot
pm2 startup
pm2 save
```

---

## 🌐 Method 4: Nginx Reverse Proxy

### Nginx Config

Create `/etc/nginx/sites-available/ai-arena`:

```nginx
upstream ai_arena {
    server 127.0.0.1:3001;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name arena.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name arena.yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/arena.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/arena.yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Proxy settings
    location / {
        proxy_pass http://ai_arena;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static file caching
    location ~* \\.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
        proxy_pass http://ai_arena;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable Site

```bash
# Link config
sudo ln -s /etc/nginx/sites-available/ai-arena /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

### SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d arena.yourdomain.com

# Auto-renewal (cron)
sudo certbot renew --dry-run
```

---

## 🔒 Security Hardening

### Firewall (UFW)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable
sudo ufw enable

# Status
sudo ufw status
```

### Fail2ban

```bash
# Install
sudo apt install fail2ban

# Configure
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit /etc/fail2ban/jail.local
# Add nginx-limit-req jail if using nginx rate limiting

# Start
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Environment Variables

**NEVER commit `.env` to git!**

```bash
# Add to .gitignore
echo ".env" >> .gitignore

# Secure permissions
chmod 600 .env

# Use secrets management in production
# - Docker secrets
# - Kubernetes secrets
# - AWS Secrets Manager
# - HashiCorp Vault
```

---

## 📊 Monitoring

### Health Check Endpoint

Add to `server/server.js`:

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    memory: process.memoryUsage()
  });
});
```

### Monitoring Tools

**1. Built-in Node.js Metrics**

```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# View metrics
pm2 monit
```

**2. Prometheus + Grafana**

Install `prom-client`:

```javascript
const promClient = require('prom-client');
const register = new promClient.Registry();

// Collect default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

register.registerMetric(httpRequestDuration);

// Expose metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

**3. Uptime Monitoring**

- UptimeRobot (free)
- Pingdom
- StatusCake
- Custom healthcheck script:

```bash
#!/bin/bash
URL="http://localhost:3001/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $RESPONSE -eq 200 ]; then
  echo "✅ Server healthy"
  exit 0
else
  echo "❌ Server down (HTTP $RESPONSE)"
  # Send alert (email, Slack, etc.)
  exit 1
fi
```

---

## 🔄 Updates & Maintenance

### Zero-Downtime Deployment

**Using PM2:**

```bash
# Pull latest code
git pull

# Install dependencies
npm install

# Reload with zero downtime
pm2 reload ai-arena
```

**Using systemd:**

```bash
# Pull code
git pull
npm install

# Restart service
sudo systemctl restart ai-arena

# Or graceful reload if app supports SIGUSR2
kill -SIGUSR2 $(cat /var/run/ai-arena.pid)
```

### Backup Strategy

```bash
#!/bin/bash
# backup.sh - Backup data directory

BACKUP_DIR="/backups/ai-arena"
DATA_DIR="/path/to/ai-battle-arena/data"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
tar -czf "$BACKUP_DIR/data_$TIMESTAMP.tar.gz" -C "$DATA_DIR" .

# Keep only last 7 days
find "$BACKUP_DIR" -name "data_*.tar.gz" -mtime +7 -delete

echo "✅ Backup complete: data_$TIMESTAMP.tar.gz"
```

Add to cron:

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/ai-arena-backup.log 2>&1
```

---

## 🧪 Testing Production Deployment

### Load Testing

```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test
ab -n 1000 -c 10 http://localhost:3001/api/agents

# Or use wrk
wrk -t4 -c100 -d30s http://localhost:3001/api/agents
```

### Smoke Tests

```bash
#!/bin/bash
# smoke-test.sh

echo "🧪 Running smoke tests..."

# Test 1: Server responds
if curl -f http://localhost:3001/api/agents > /dev/null 2>&1; then
  echo "✅ API responding"
else
  echo "❌ API not responding"
  exit 1
fi

# Test 2: Start battle
BATTLE=$(curl -s -X POST http://localhost:3001/api/battle/start \\
  -H "Content-Type: application/json" \\
  -d '{"agent1Id":"bash-quickfingers","agent2Id":"ceo"}')

if echo "$BATTLE" | grep -q "battleId"; then
  echo "✅ Battle system working"
else
  echo "❌ Battle system failed"
  exit 1
fi

echo "🎉 All smoke tests passed!"
```

---

## 📈 Performance Optimization

### Node.js Tuning

```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=2048" node server/server.js

# Use production mode
NODE_ENV=production node server/server.js
```

### Clustering

```javascript
// cluster.js
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  require('./server/server.js');
}
```

Run:
```bash
node cluster.js
```

### Caching

Add Redis for session storage:

```bash
npm install redis express-session connect-redis
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different port
PORT=3002 node server/server.js
```

### Permission Errors

```bash
# Fix data directory permissions
sudo chown -R $USER:$USER data/
chmod 755 data/
```

### Out of Memory

```bash
# Increase Node.js heap
NODE_OPTIONS="--max-old-space-size=4096" node server/server.js

# Monitor memory
watch -n 1 'ps aux | grep node'
```

### God AI Timeout

Check OpenClaw Gateway:

```bash
# Status
curl http://localhost:18789/health

# Restart if needed
openclaw gateway restart
```

---

## ✅ Production Checklist

Before going live:

- [ ] `.env` configured with production values
- [ ] `NODE_ENV=production` set
- [ ] Database/data directory backed up
- [ ] SSL certificate installed and renewed
- [ ] Firewall configured (UFW/iptables)
- [ ] Monitoring enabled (PM2/Prometheus)
- [ ] Logging configured and rotated
- [ ] Health check endpoint working
- [ ] Load testing completed
- [ ] Backup strategy in place
- [ ] Error tracking (Sentry/Rollbar)
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Static assets cached
- [ ] Gzip compression enabled
- [ ] Security headers set

---

**🚀 Ready to deploy!**

Choose your method and follow the guide. For production, use Docker + Nginx + SSL.

Questions? See DOCUMENTATION.md or raise an issue.
