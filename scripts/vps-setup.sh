#!/bin/bash
set -e

# ==========================================
# UBUNTU 24.04 LTS VPS INITIAL PROVISIONING
# ==========================================

echo "Starting server provisioning for Stock Platform deployment..."

# 1. System Package Updates
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip software-properties-common ufw fail2ban certbot python3-certbot-nginx openssl htop

# 2. Docker & Docker Compose Installation
if ! command -v docker &> /dev/null; then
    echo "Installing Docker Engine..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose plugin..."
    sudo apt install -y docker-compose-v2
fi

# 3. UFW Firewall Hardening
echo "Configuring UFW Firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable

# 4. Fail2Ban Configuration
echo "Configuring Fail2Ban..."
sudo cat << 'EOF' | sudo tee /etc/fail2ban/jail.local
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
findtime = 600
bantime = 86400
EOF

sudo systemctl restart fail2ban
sudo systemctl enable fail2ban

# 5. SSH Security Hardening
echo "Applying SSH Security Hardening..."
sudo sed -i 's/#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh || sudo systemctl restart sshd

echo "VPS System Provisioning completed successfully!"
