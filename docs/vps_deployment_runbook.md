# Enterprise Linux VPS Deployment & SRE Operations Runbook

This document provides a step-by-step guide for deploying and operating the Stock Market Analysis Platform manually on an Ubuntu 24.04 LTS VPS without managed cloud services.

---

## 1. System Requirements & Hardware Specifications

| Environment Tier | Minimum Recommended Specs |
| :--- | :--- |
| **Development / Staging** | 4 vCPU, 8 GB RAM, 100 GB SSD |
| **Production Tier** | 8 vCPU, 16 GB RAM, 250 GB NVMe SSD |

---

## 2. Server Provisioning & Security Hardening

### Step 1: Initial System Provisioning
Execute the automated VPS setup script on your clean Ubuntu 24.04 instance:
```bash
chmod +x ./scripts/vps-setup.sh
sudo ./scripts/vps-setup.sh
```

This installs Docker, Docker Compose, Nginx, Certbot, UFW, and Fail2Ban, and configures UFW rules:
- **Port 22**: SSH (Restricted to key authentication)
- **Port 80**: HTTP (Redirects to HTTPS)
- **Port 443**: HTTPS (TLS 1.3 encrypted)

### Step 2: SSH Security Rules (`/etc/ssh/sshd_config`)
Ensure root login is disabled and password authentication is turned off:
```ini
PermitRootLogin no
PasswordAuthentication no
X11Forwarding no
MaxAuthTries 3
```

---

## 3. Domain Name & Let's Encrypt SSL Setup

### Step 1: DNS A-Record Configuration
Point your domain's DNS records to your VPS public IPv4 address:
- `yourdomain.com` -> `<VPS_PUBLIC_IP>`
- `api.yourdomain.com` -> `<VPS_PUBLIC_IP>`
- `admin.yourdomain.com` -> `<VPS_PUBLIC_IP>`

### Step 2: Obtain SSL Certificates via Certbot
```bash
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot certonly --nginx -d api.yourdomain.com
sudo certbot certonly --nginx -d admin.yourdomain.com
```

### Step 3: Link Host Nginx Configuration
```bash
sudo cp ./nginx/vps-nginx.conf /etc/nginx/sites-available/stock-platform.conf
sudo ln -s /etc/nginx/sites-available/stock-platform.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. Application Deployment & Operations

### Step 1: Environment Variables Setup
Copy `.env.example` to `.env` and fill in production secrets:
```bash
cp .env.example .env
nano .env
```

### Step 2: Deploy Production Stack
Execute the automated deployment script:
```bash
chmod +x ./scripts/*.sh
./scripts/deploy.sh
```

### Step 3: Verify Synthetic Health
```bash
./scripts/health-check.sh
```

---

## 5. Automated Backups & Disaster Recovery

### Step 1: Crontab Backup Rotation
Configure automated daily database backups (`crontab -e`):
```cron
# Daily PostgreSQL backup at 03:00 AM
0 3 * * * /home/ubuntu/stock/scripts/backup-postgres.sh >> /var/log/stock-backup.log 2>&1

# Daily Redis backup at 03:30 AM
30 3 * * * /home/ubuntu/stock/scripts/backup-redis.sh >> /var/log/stock-backup.log 2>&1
```

### Step 2: Emergency Disaster Restore
In case of database corruption or hardware failover:
```bash
./scripts/restore-postgres.sh ./backups/postgres/postgres_stock_db_YYYYMMDD_HHMMSS.sql.gz
```

### Step 3: Emergency Application Rollback
If a deployment fails health checks:
```bash
./scripts/rollback.sh
```

---

## 6. Prometheus & Grafana Monitoring Stack

Launch the SRE telemetry stack:
```bash
docker compose -f monitoring/docker-compose.monitoring.yml up -d
```
- **Prometheus UI**: `http://<VPS_IP>:9090`
- **Grafana Dashboard**: `http://<VPS_IP>:3001` (Default login: `admin` / `SuperSecureGrafanaPass2026!`)
