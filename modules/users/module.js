module.exports = function(app) {
    const path = require('path');
    const api = require(path.join(__dirname, 'api.js'))(app);
    const backend = require(path.join(__dirname, 'backend.js'))(app);
    app.get('log').info('[users] module loaded');
    return {
        backend: {
            prefix: '/users',
            routes: backend.routes,
            info: backend.info
        },
        api: {
            prefix: '/users',
            routes: api.routes
        }
    };
};