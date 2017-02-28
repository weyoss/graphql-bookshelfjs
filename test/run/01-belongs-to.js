'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const graphQL = require('graphql');
const graphQLBookshelf = require('./../../src');

describe('Case 1', function () {

    it('resolves "hasOne" relationship' , function() {

        this.sandbox.tracker.on('query', function (query, step) {
            const responses = [
                function () {
                    expect(query.sql).to.equal('select `articles`.* from `articles`');
                    query.response([
                        {id: 5000, user_id: 1000, title: "Title A"},
                        {id: 5001, user_id: 1000, title: "Title B"},
                        {id: 5002, user_id: 1001, title: "Title C"},
                    ]);
                },
                function () {
                    expect(query.sql).to.equal('select `users`.* from `users` where `id` in (?, ?, ?)');
                    expect(query.bindings).to.eql([1000, 1000, 1001]);
                    query.response([
                        {id: 1000, name: "FirstName1 LastName1"},
                        {id: 1001, name: "FirstName2 LastName2"}
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
                articles { 
                    id,
                    title, 
                    user { 
                        id,
                        name
                    }
                } 
            }`;

        return graphQL.graphql(this.sandbox.graphQLSchema, queryString, null, {loaders: graphQLBookshelf.getLoaders()})
            .then(function (results) {

                const expected = {
                    "data": {
                        "articles": [
                            {
                                "id": 5000,
                                "title": "Title A",
                                "user": {
                                    "id": "1000",
                                    "name": "FirstName1 LastName1"
                                }
                            },
                            {
                                "id": 5001,
                                "title": "Title B",
                                "user": {
                                    "id": "1000",
                                    "name": "FirstName1 LastName1"
                                }
                            },
                            {
                                "id": 5002,
                                "title": "Title C",
                                "user": {
                                    "id": "1001",
                                    "name": "FirstName2 LastName2"
                                }
                            }
                        ]
                    }
                };

                expect(results).to.eql(expected);
            });
    });

});
