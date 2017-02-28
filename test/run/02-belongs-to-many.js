'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const graphQL = require('graphql');
const graphQLBookshelf = require('./../../src');

describe('Case 2', function () {

    it('resolves "belongsToMany" relationship' , function() {

        this.sandbox.tracker.on('query', function (query, step) {
            const responses = [
                function () {
                    expect(query.sql).to.equal('select `users`.* from `users`');
                    query.response([
                        {id: 1000, name: "FirstName1 LastName1"},
                        {id: 1001, name: "FirstName2 LastName2"},
                        {id: 1002, name: "FirstName3 LastName3"}
                    ]);
                },
                function () {
                    expect(query.sql).to.equal('select `accounts`.*, `users_accounts`.* from `accounts` inner join `users_accounts` on `accounts`.`id` = `users_accounts`.`account_id` where `users_accounts`.`user_id` in (?, ?, ?)');
                    expect(query.bindings).to.eql([1000, 1001, 1002]);
                    query.response([
                        {id: 4000, user_id: 1000, name: "Viewer account"},
                        {id: 4001, user_id: 1000, name: "Admin account"},
                        {id: 4002, user_id: 1001, name: "Viewer account"},
                        {id: 4003, user_id: 1002, name: "Viewer account"},
                    ]);
                }
            ];
            if ( !responses[step - 1] ) {
                throw new Error(`Unexpected query (${step}): ${query.sql}`);
            }
            responses[step - 1]();
        });

        const queryString =
            `{ 
                users { 
                    id,
                    name, 
                    accounts { 
                        id,
                        name
                    }
                } 
            }`;

        return graphQL.graphql(this.sandbox.graphQLSchema, queryString, null, {loaders: graphQLBookshelf.getLoaders()})
            .then(function (results) {

                 const expected = {
                     "data": {
                         "users": [
                             {
                                 "id": "1000",
                                 "name": "FirstName1 LastName1",
                                 "accounts": [
                                     {
                                         "id": 4000,
                                         "name": "Viewer account"
                                     },
                                     {
                                         "id": 4001,
                                         "name": "Admin account"
                                     }
                                 ]
                             },
                             {
                                 "id": "1001",
                                 "name": "FirstName2 LastName2",
                                 "accounts": [
                                     {
                                         "id": 4002,
                                         "name": "Viewer account"
                                     }
                                 ]
                             },
                             {
                                 "id": "1002",
                                 "name": "FirstName3 LastName3",
                                 "accounts": [
                                     {
                                         "id": 4003,
                                         "name": "Viewer account"
                                     }
                                 ]
                             }
                         ]
                     }
                 };

                 expect(results).to.eql(expected);
            });
    });

});
