#!/bin/bash

# --- Configuration ---
PROJECT_DIR=$(pwd)
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
NGINX_CONF="/etc/nginx/sites-available/certificate-generator"

echo "------------------------------------------------"
echo "🚀 Starting Deployment on EC2 ($PUBLIC_IP)"
echo "------------------------------------------------"

# 1. Update System
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 20
if ! command -v node &> /dev/null; then
    echo "🟢 Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js is already installed ($(node -v))"
fi

# 3. Install Nginx
if ! command -v nginx &> /dev/null; then
    echo "🟢 Installing Nginx..."
    sudo apt install nginx -y
else
    echo "✅ Nginx is already installed"
fi

# 4. Install PM2 (Process Manager)
if ! command -v pm2 &> /dev/null; then
    echo "🟢 Installing PM2 globally..."
    sudo npm install -g pm2
else
    echo "✅ PM2 is already installed"
fi

# 5. Install Project Dependencies
echo "📦 Installing project dependencies..."
npm install

# 6. Build Frontend
echo "🏗️ Building the React frontend..."
npm run build

# 7. Start/Restart Email Backend with PM2
echo "⚙️ Starting the SMTP Email Server (server.cjs)..."
pm2 delete cert-backend 2>/dev/null || true
pm2 start server.cjs --name "cert-backend"
pm2 save

# 8. Configure Nginx
echo "🌐 Configuring Nginx..."

cat <<EOF | sudo tee $NGINX_CONF
server {
    listen 80;
    server_name $PUBLIC_IP;

    root $PROJECT_DIR/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy API requests to the Node.js server (Port 3001)
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the configuration and restart Nginx
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "------------------------------------------------"
echo "✅ DEPLOYMENT COMPLETE!"
echo "🌍 App is live at: http://$PUBLIC_IP"
echo "------------------------------------------------"
