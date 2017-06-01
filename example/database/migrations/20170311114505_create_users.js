'use strict';

exports.up = function up(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('users', (table) => {
            table.increments('id').primary();
            table.string('username').notNull();
            table.string('password').notNull();
            table.string('email').notNull();
        }),
    ]);
};

exports.down = function down(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('users'),
    ]);
};
