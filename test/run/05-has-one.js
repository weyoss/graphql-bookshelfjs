'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const graphQL = require('graphql');
const graphQLBookshelf = require('./../../src');

describe('Case 5', function () {

    it('resolves "hasOne" relationships' , function() {

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
                    expect(query.sql).to.equal('select `profiles`.* from `profiles` where `user_id` in (?, ?, ?)');
                    expect(query.bindings).to.eql([1000, 1001, 1002]);
                    query.response([
                        {id: 2000, user_id: 1000, first_name: "FirstName1", last_name: "LastName1", birthday: "1952-12-01"},
                        {id: 2001, user_id: 1001, first_name: "FirstName2", last_name: "LastName2", birthday: "1974-05-25"},
                        {id: 2002, user_id: 1002, first_name: "FirstName3", last_name: "LastName3", birthday: "1945-02-07"},
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
                    profile { 
                        id,
                        first_name,
                        last_name,
                        birthday
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
                                "profile": {
                                    "id": 2000,
                                    "first_name": "FirstName1",
                                    "last_name": "LastName1",
                                    "birthday": "1952-12-01"
                                }
                            },
                            {
                                "id": "1001",
                                "name": "FirstName2 LastName2",
                                "profile": {
                                    "id": 2001,
                                    "first_name": "FirstName2",
                                    "last_name": "LastName2",
                                    "birthday": "1974-05-25"
                                }
                            },
                            {
                                "id": "1002",
                                "name": "FirstName3 LastName3",
                                "profile": {
                                    "id": 2002,
                                    "first_name": "FirstName3",
                                    "last_name": "LastName3",
                                    "birthday": "1945-02-07"
                                }
                            }
                        ]
                    }
                };

                expect(results).to.eql(expected);
            });
    });

});
