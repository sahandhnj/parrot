module.exports = {
    port: 3710,
    protocol: 'http',
    morgan: {
        level: 'dev'
    },
    database: {
        user: 'postgres',
        host: 'localhost',
        database: 'parrotdb',
        password: 'password',
        port: 5432
    }
};
