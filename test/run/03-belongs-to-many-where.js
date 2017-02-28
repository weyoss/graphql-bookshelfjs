'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const graphQL = require('graphql');
const graphQLBookshelf = require('./../../src');

describe('Case 3', function () {

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
                    expect(query.sql).to.equal('select `accounts`.*, `users_accounts`.* from `accounts` inner join `users_accounts` on `accounts`.`id` = `users_accounts`.`account_id` where `access` = ? and `users_accounts`.`user_id` in (?, ?, ?)');
                    expect(query.bindings).to.eql(['admin', 1000, 1001, 1002]);
                    query.response([
                        {id: 4001, user_id: 1000, name: "Admin account"}
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
                    admin_accounts {
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
                                 "admin_accounts": [
                                     {
                                         "id": 4001,
                                         "name": "Admin account"
                                     }
                                 ]
                             },
                             {
                                 "id": "1001",
                                 "name": "FirstName2 LastName2",
                                 "admin_accounts": []
                             },
                             {
                                 "id": "1002",
                                 "name": "FirstName3 LastName3",
                                 "admin_accounts": []
                             }
                         ]
                     }
                 };

                 expect(results).to.eql(expected);
            });
    });

});
