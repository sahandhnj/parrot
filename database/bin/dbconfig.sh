#!/bin/bash

database="parrotdb"

echo "Configuring database: $database..."

dropdb -U postgres parrotdb
createdb -U postgres parrotdb

psql -U postgres parrotdb < ./bin/sql/audolog.sql

echo "$database configured."
