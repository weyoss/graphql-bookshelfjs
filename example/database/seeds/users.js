'use strict';

const users = [
    {
        username: 'user1',
        password: 'password1',
        email: 'user1@email.com'
    },
    {
        username: 'user2',
        password: 'password2',
        email: 'user2@email.com'
    },
    {
        username: 'user3',
        password: 'password3',
        email: 'user3@email.com'
    },
    {
        username: 'user4',
        password: 'password4',
        email: 'user4@email.com'
    },
    {
        username: 'user5',
        password: 'password5',
        email: 'user5@email.com'
    },
    {
        username: 'user6',
        password: 'password6',
        email: 'user6@email.com'
    },
];

exports.seed = function(knex, Promise) {
    const promises = users.map( user => {
        return knex.table('users').insert(user);
    });
    return Promise.all(promises);
};