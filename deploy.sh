#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

REMOTE="ubuntu@92.5.80.61"
TARGET_DIR="/var/www/site/public"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"

rsync -av --delete \
  --exclude '.git' \
  --exclude '.gitignore' \
  --exclude 'deploy.sh' \
  --exclude 'Caddyfile.example' \
  -e "ssh -i ${SSH_KEY} -o IdentitiesOnly=yes" \
  ./ "${REMOTE}:${TARGET_DIR}/"

echo "Deploy complete: ${REMOTE}:${TARGET_DIR}"
