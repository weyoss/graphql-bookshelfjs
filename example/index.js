'use strict';

const graphQL = require('graphql');
const graphQLBookshelf = require('graphql-bookshelfjs');

const config = require('./knexfile');
const knex = require('knex')(config);
const bookshelf = require('bookshelf')(knex);

const models = require('./models')(bookshelf);
const graphQLSchema = require('./graphql/schema')(models);

const queryString =
`{ 
    articles (count: 3, from: 5, published: true) { 
        id,
        title,
        posted,
        user {
            id,
            username
        },
        comments (count: 2) {
            id,
            body,
            posted,
            user {
                id,
                username
            }
        }
    } 
}`;

graphQL.graphql(graphQLSchema, queryString, null, {loaders: graphQLBookshelf.getLoaders()})
    .then(function (results) {
        console.log( JSON.stringify(results, null, 4) );
        process.exit(0);
    });