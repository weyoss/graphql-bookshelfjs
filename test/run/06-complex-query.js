'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const graphQL = require('graphql');
const graphQLBookshelf = require('./../../src');

describe('Case 6', function () {

    it('resolves a query which includes "hasOne", "hasMany", "belongsTo", "belongsToMany" relationships' , function() {

        this.sandbox.tracker.on('query', function (query, step) {
            const responses = [
                function () {
                    expect(query.sql).to.equal('select `articles`.* from `articles`');
                    query.response([
                        {id: 5000, user_id: 1000, title: "Title A"},
                        {id: 5001, user_id: 1001, title: "Title B"},
                        {id: 5002, user_id: 1002, title: "Title C"},
                    ]);
                },
                function () {
                    expect(query.sql).to.equal('select `users`.* from `users` where `id` in (?, ?, ?)');
                    expect(query.bindings).to.eql([1000, 1001, 1002]);
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
                articles { 
                    id,
                    title, 
                    user { 
                        id,
                        name,
                        profile {
                            id,
                            first_name,
                            last_name,
                            birthday
                        },
                        notes {
                            id,
                            note
                        },
                        accounts {
                            id,
                            name
                        },
                        admin_accounts {
                            id,
                            name
                        }
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
                                    "name": "FirstName1 LastName1",
                                    "profile": {
                                        "id": 2000,
                                        "first_name": "FirstName1",
                                        "last_name": "LastName1",
                                        "birthday": "1952-12-01"
                                    },
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
                                    ],
                                    "accounts": [
                                        {
                                            "id": 4000,
                                            "name": "Viewer account"
                                        },
                                        {
                                            "id": 4001,
                                            "name": "Admin account"
                                        }
                                    ],
                                    "admin_accounts": [
                                        {
                                            "id": 4001,
                                            "name": "Admin account"
                                        }
                                    ]
                                }
                            },
                            {
                                "id": 5001,
                                "title": "Title B",
                                "user": {
                                    "id": "1001",
                                    "name": "FirstName2 LastName2",
                                    "profile": {
                                        "id": 2001,
                                        "first_name": "FirstName2",
                                        "last_name": "LastName2",
                                        "birthday": "1974-05-25"
                                    },
                                    "notes": [],
                                    "accounts": [
                                        {
                                            "id": 4002,
                                            "name": "Viewer account"
                                        }
                                    ],
                                    "admin_accounts": []
                                }
                            },
                            {
                                "id": 5002,
                                "title": "Title C",
                                "user": {
                                    "id": "1002",
                                    "name": "FirstName3 LastName3",
                                    "profile": {
                                        "id": 2002,
                                        "first_name": "FirstName3",
                                        "last_name": "LastName3",
                                        "birthday": "1945-02-07"
                                    },
                                    "notes": [
                                        {
                                            "id": 3003,
                                            "note": "My note D"
                                        }
                                    ],
                                    "accounts": [
                                        {
                                            "id": 4003,
                                            "name": "Viewer account"
                                        }
                                    ],
                                    "admin_accounts": []
                                }
                            }
                        ]
                    }
                };

                expect(results).to.eql(expected);
            });
    });

});
