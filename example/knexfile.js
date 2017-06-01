'use strict';

const path = require('path');

module.exports = {
    client: 'sqlite3',
    connection: {
        filename: path.normalize(`${__dirname}/database/example.db`),
    },
    seeds: {
        directory: path.normalize(`${__dirname}/database/seeds`),
    },
    migrations: {
        directory: path.normalize(`${__dirname}/database/migrations`),
    },
    useNullAsDefault: true,
    debug: true,
};
