'use strict';


exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('comments', function(table){
            table.increments('id').primary();
            table.string('body').notNull();
            table.dateTime('posted').notNull();
            table.integer('user_id').notNull();
            table.integer('article_id').notNull();
        })
    ])
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('comments')
    ])
};