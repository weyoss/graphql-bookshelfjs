'use strict';

exports.up = function up(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('articles', (table) => {
            table.increments('id').primary();
            table.string('title').notNull();
            table.string('body').notNull();
            table.dateTime('posted').notNull();
            table.boolean('published').notNull();
            table.integer('user_id').notNull();
        }),
    ]);
};

exports.down = function down(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('articles'),
    ]);
};
