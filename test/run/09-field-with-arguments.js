'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const graphQL = require('graphql');
const graphQLBookshelf = require('./../../src');

describe('Case 9', function () {

    it('resolves a parameter field with arguments' , function() {
        this.sandbox.tracker.on('query', function (query, step) {
            const responses = [
                function () {
                    expect(query.sql).to.equal('select `users`.* from `users` where `users`.`id` = ? limit ?');
                    expect(query.bindings).to.eql(['1000', 1]);
                    query.response([
                        {id: 1000, name: "FirstName1 LastName1"},
                    ]);
                },
                function () {
                    expect(query.sql).to.equal('select `articles`.* from `articles` where `articles`.`is_published` = ? and `user_id` in (?)');
                    expect(query.bindings).to.eql([true, 1000]);
                    query.response([
                        {id: 5000, user_id: 1000, title: "Title A", is_published: true}
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
                user (id: 1000) {
                    id,
                    name,
                    articles (is_published: true) {
                        id,
                        title,
                        is_published
                    }
                }
            }`;

        return graphQL.graphql(this.sandbox.graphQLSchema, queryString, null, {loaders: graphQLBookshelf.getLoaders()})
            .then(function (results) {
                const expected = {
                    "data": {
                        "user": {
                            "articles": [
                                {
                                    "id": 5000,
                                    "title": "Title A",
                                    "is_published": true
                                }
                            ],
                            "id": "1000",
                            "name": "FirstName1 LastName1"
                        }
                    }
                };
                expect(results).to.eql(expected);
            });
    });

});
