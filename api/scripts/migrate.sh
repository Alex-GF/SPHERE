set -e

echo "Constructing MongoDB URI..."

DATABASE_PROTOCOL=${MONGO_PROTOCOL}
DATABASE_HOST=${MONGO_HOST}
DATABASE_PORT=${MONGO_PORT:+":$MONGO_PORT"}
DATABASE_USERNAME=${DATABASE_USERNAME}
DATABASE_PASSWORD=${DATABASE_PASSWORD}
DATABASE_NAME=${DATABASE_NAME}

if [ -n "$DATABASE_USERNAME" ] && [ -n "$DATABASE_PASSWORD" ]; then
  DB_CREDENTIALS="${DATABASE_USERNAME}:${DATABASE_PASSWORD}@"
else
  DB_CREDENTIALS=""
fi

if [ "$DATABASE_PROTOCOL" = "mongodb+srv" ]; then
  AUTH_SOURCE=""
else
  AUTH_SOURCE="?authSource=${DATABASE_NAME}"
fi

MONGO_URI="${DATABASE_PROTOCOL}://${DB_CREDENTIALS}${DATABASE_HOST}${DATABASE_PORT}/${DATABASE_NAME}${AUTH_SOURCE}"

echo "Mongo URI constructed"

# -----------------------------
# Esperar a MongoDB
# -----------------------------
echo "Waiting for MongoDB at ${DATABASE_HOST}${DATABASE_PORT}..."

until node -e "
const net = require('net');
const client = new net.Socket();
client.setTimeout(1000);
client.on('connect', () => { client.destroy(); process.exit(0); });
client.on('error', () => process.exit(1));
client.on('timeout', () => process.exit(1));
client.connect(${MONGO_PORT:-27017}, '${DATABASE_HOST}');
"; do
  sleep 1
done

echo "MongoDB is up"

# -----------------------------
# Ejecutar migraciones
# -----------------------------
echo "Running migrations..."

npx migrate up --uri "$MONGO_URI" -m ./src/main/migrations/mongo/ -a true

echo "Migrations completed"