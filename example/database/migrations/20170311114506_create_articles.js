'use strict';


exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('articles', function(table){
            table.increments('id').primary();
            table.string('title').notNull();
            table.string('body').notNull();
            table.dateTime('posted').notNull();
            table.boolean('published').notNull();
            table.integer('user_id').notNull();
        })
    ])
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('articles')
    ])
};