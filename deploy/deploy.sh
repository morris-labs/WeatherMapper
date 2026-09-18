#!/usr/bin/env bash
# deploy.sh — ship WeatherMapper to EC2 and rebuild the static assets.
#
# Required env vars (set these in your shell or a local, untracked .env):
#   SSH_KEY   — path to the EC2 key pair PEM file
#   EC2_HOST  — EC2 instance hostname or Elastic IP
#
# Usage:
#   SSH_KEY=~/.ssh/morrislabs.pem EC2_HOST=<ip> ./deploy/deploy.sh
set -euo pipefail

: "${SSH_KEY:?SSH_KEY must be set}"
: "${EC2_HOST:?EC2_HOST must be set}"

REMOTE_DIR=/opt/weathermapper

echo "==> Packaging source..."
git archive --format=tar HEAD | gzip > /tmp/weathermapper.tar.gz

echo "==> Shipping to ${EC2_HOST}..."
scp -i "$SSH_KEY" /tmp/weathermapper.tar.gz ec2-user@"${EC2_HOST}":/tmp/

echo "==> Extracting on remote..."
ssh -i "$SSH_KEY" ec2-user@"${EC2_HOST}" \
  "mkdir -p ${REMOTE_DIR} && tar -xzf /tmp/weathermapper.tar.gz -C ${REMOTE_DIR} && rm /tmp/weathermapper.tar.gz"

echo "==> Installing dependencies and building..."
ssh -i "$SSH_KEY" ec2-user@"${EC2_HOST}" \
  "cd ${REMOTE_DIR}/client && npm install && VITE_BASE_PATH=/weathermapper/ npm run build"

echo "==> Reloading nginx..."
ssh -i "$SSH_KEY" ec2-user@"${EC2_HOST}" \
  "sudo nginx -t && sudo systemctl reload nginx"

echo "==> Done. https://morrislabs.app/weathermapper/"
