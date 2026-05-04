#!/bin/sh

# -----------------------------
# Ejecutar migraciones
# -----------------------------
chmod +x ./scripts/migrate.sh
./scripts/migrate.sh

# -----------------------------
# Arrancar servidor
# -----------------------------
echo "Starting server..."

exec node dist/main/backend.js