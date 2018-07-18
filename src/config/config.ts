let node_env = process.env.NODE_ENV || 'development';
node_env = node_env.replace(/'/g, '');

const defaults = require('./env/default');

switch (node_env) {
    case 'development':
        module.exports = Object.assign({}, defaults, require('./env/development'));
        break;
    case 'production':
        module.exports = Object.assign({}, defaults, require('./env/production'));
        break;
}
