'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const graphQL = require('graphql');
const graphQLBookshelf = require('./../../src');

describe('Case 4', function () {

    it('resolves "hasMany" relationship' , function() {

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
                    expect(query.sql).to.equal('select `notes`.* from `notes` where `user_id` in (?, ?, ?)');
                    expect(query.bindings).to.eql([1000, 1001, 1002]);
                    query.response([
                        {id: 3000, user_id: 1000, note: 'My note A'},
                        {id: 3001, user_id: 1000, note: 'My note B'},
                        {id: 3002, user_id: 1000, note: 'My note C'},
                        {id: 3003, user_id: 1002, note: 'My note D'},
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
                    notes { 
                        id,
                        note
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
                                "notes": [
                                    {
                                        "id": 3000,
                                        "note": "My note A"
                                    },
                                    {
                                        "id": 3001,
                                        "note": "My note B"
                                    },
                                    {
                                        "id": 3002,
                                        "note": "My note C"
                                    }
                                ]
                            },
                            {
                                "id": "1001",
                                "name": "FirstName2 LastName2",
                                "notes": []
                            },
                            {
                                "id": "1002",
                                "name": "FirstName3 LastName3",
                                "notes": [
                                    {
                                        "id": 3003,
                                        "note": "My note D"
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
