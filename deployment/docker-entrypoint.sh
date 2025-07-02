
#!/bin/sh
set -e

echo "🚀 Starting Naggery App initialization..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  echo "⏳ Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Run database migrations
echo "🔧 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client (in case of any changes)
echo "🔧 Generating Prisma client..."
npx prisma generate

# Seed database if SEED_DATABASE is true
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed || echo "⚠️ Seeding failed or already done"
fi

echo "✅ Initialization complete!"

# Start the application
echo "🚀 Starting Naggery App..."
exec "$@"
