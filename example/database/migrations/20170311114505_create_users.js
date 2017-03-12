'use strict';


exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('users', function(table) {
            table.increments('id').primary();
            table.string('username').notNull();
            table.string('password').notNull();
            table.string('email').notNull();
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('users')
    ]);
};