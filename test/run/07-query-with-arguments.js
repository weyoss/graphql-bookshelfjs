'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const graphQL = require('graphql');
const graphQLBookshelf = require('./../../src');

describe('Case 7', function () {

    it('resolves a query with parameters' , function() {
        this.sandbox.tracker.on('query', function (query, step) {
            const responses = [
                function () {
                    expect(query.sql).to.equal('select `articles`.* from `articles` where `articles`.`user_id` = ? and `articles`.`is_published` = ?');
                    expect(query.bindings).to.eql([1000, true]);
                    query.response([
                        {id: 5000, user_id: 1000, title: "Title A"},
                        {id: 5001, user_id: 1000, title: "Title B"}
                    ]);
                },
                function () {
                    expect(query.sql).to.equal('select `users`.* from `users` where `id` in (?, ?)');
                    expect(query.bindings).to.eql([1000, 1000]);
                    query.response([
                        {id: 1000, name: "FirstName1 LastName1"}
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
                articles (user_id:1000, is_published:true) { 
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
                            }
                        ]
                    }
                };
                expect(results).to.eql(expected);
            });
    });

});
