#!/usr/bin/env bash
# Generates a bcrypt hash for a new admin password, in the same format
# Spring Security's BCryptPasswordEncoder produces/expects.
#
# Usage: ./hash-password.sh "your-new-password"
# Then set ADMIN_PASSWORD_HASH to the output (quote it in .env, it contains $ characters).
set -euo pipefail
PASSWORD="${1:?Usage: hash-password.sh <password>}"
python3 - "$PASSWORD" <<'PY'
import sys, crypt
print(crypt.crypt(sys.argv[1], crypt.mksalt(crypt.METHOD_BLOWFISH, rounds=2**10)))
PY
