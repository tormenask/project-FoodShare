
#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE auth_db;
    CREATE DATABASE restaurant_db;
    CREATE DATABASE order_db;
    GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE restaurant_db TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE order_db TO postgres;
EOSQL
