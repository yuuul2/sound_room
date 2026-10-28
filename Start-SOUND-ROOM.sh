#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
if ! command -v node >/dev/null; then
  echo 'Install Node.js 24 LTS from https://nodejs.org first.'
  exit 1
fi
if [[ ! -f node_modules/expo/package.json ]]; then npm ci; fi
printf '%s\n' 'Connect phone and computer to the same Wi-Fi. Scan the QR code with Expo Go (Android) or Camera (iPhone). Keep this terminal open.'
exec npm run start:lan
