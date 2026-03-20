#!/bin/bash

PROJECT_DIR=$(pwd)
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
NGINX_CONF="/etc/nginx/sites-available/certificate-generator"

echo "🚀 Starting Deployment on EC2 ($PUBLIC_IP)"

sudo apt update && sudo apt upgrade -y

if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
fi

if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

npm install

rm -rf dist
npm run build

pm2 delete cert-backend 2>/dev/null || true
pm2 start server.cjs --name "cert-backend"
pm2 save

cat <<EOF | sudo tee $NGINX_CONF
server {
    listen 80;
    server_name $PUBLIC_IP;

    root $PROJECT_DIR/dist;
    index index.html;
    client_max_body_size 100M;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location ~* \.(?:png|jpg|jpeg|gif|ico|svg)$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    }
}
EOF

sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "✅ DEPLOYMENT COMPLETE! http://$PUBLIC_IP"
