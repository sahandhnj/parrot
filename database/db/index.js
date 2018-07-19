// create a connection pool

const { Pool } = require('pg');
const DbConfig = require('../config/dbconfig');
const pool = new Pool(DbConfig);

module.exports = pool;
