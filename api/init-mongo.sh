# mongo-init/init-mongo.sh
echo "Creating mongo users..."
mongosh admin --host localhost -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD <<-EOJS
    use $MONGO_INITDB_DATABASE;
    db.createUser({
        user: '$DATABASE_USERNAME',
        pwd: '$DATABASE_PASSWORD',
        roles: [{role: 'readWrite', db: '$MONGO_INITDB_DATABASE'}, {role: 'dbAdmin', db: '$MONGO_INITDB_DATABASE'}]
    });
EOJS
echo "Mongo users created."