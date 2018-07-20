#!/bin/bash

database="parrotdb"

echo "Configuring database: $database..."

dropdb -h localhost -U postgres parrotdb
createdb -h localhost -U postgres parrotdb

psql -h localhost -U postgres parrotdb < ./bin/sql/create_tables.sql

echo "$database configured."
