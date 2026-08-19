#!/bin/sh
# Select HTTP or HTTPS site config based on mounted Let's Encrypt files.
set -e

DOMAIN="${DOMAIN:-vownests.com}"
CERT_NAME="${CERT_NAME:-$DOMAIN}"
BACKEND_HOST="${BACKEND_HOST:-backend:4000}"
FRONTEND_HOST="${FRONTEND_HOST:-frontend:3000}"
CERT="/etc/letsencrypt/live/${CERT_NAME}/fullchain.pem"
KEY="/etc/letsencrypt/live/${CERT_NAME}/privkey.pem"

if [ -f "$CERT" ] && [ -f "$KEY" ]; then
  src="/etc/nginx/template-src/https.conf"
else
  src="/etc/nginx/site-available/production.conf"
fi

sed -e "s/__DOMAIN__/${DOMAIN}/g" \
    -e "s/__CERT_NAME__/${CERT_NAME}/g" \
    -e "s/__BACKEND_HOST__/${BACKEND_HOST}/g" \
    -e "s/__FRONTEND_HOST__/${FRONTEND_HOST}/g" \
    "$src" > /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
