'use strict';

const graphQL = require('graphql');
const graphQLBookshelf = require('../../src');

module.exports = function (models) {
    let NoteType = new graphQL.GraphQLObjectType({
        name: 'Note',
        fields: {
            id: {
                type: graphQL.GraphQLInt
            },
            note: {
                type: graphQL.GraphQLString
            }
        }
    });

    let ProfileType = new graphQL.GraphQLObjectType({
        name: 'Profile',
        fields: {
            id: {
                type: graphQL.GraphQLInt
            },
            first_name: {
                type: graphQL.GraphQLString
            },
            last_name: {
                type: graphQL.GraphQLString
            },
            birthday: {
                type: graphQL.GraphQLString
            }
        }
    });

    let AccountType = new graphQL.GraphQLObjectType({
        name: 'Account',
        fields: {
            id: {
                type: graphQL.GraphQLInt
            },
            name: {
                type: graphQL.GraphQLString
            }
        }
    });

    let UserType = new graphQL.GraphQLObjectType({
        name: 'User',
        fields: {
            id: {
                type: graphQL.GraphQLString
            },
            name: {
                type: graphQL.GraphQLString
            },
            profile: {
                type: ProfileType,
                resolve: graphQLBookshelf.resolverFactory(models.User)
            },
            notes: {
                type: new graphQL.GraphQLList(NoteType),
                resolve: graphQLBookshelf.resolverFactory(models.User)
            },
            accounts: {
                type: new graphQL.GraphQLList(AccountType),
                resolve: graphQLBookshelf.resolverFactory(models.User)
            },
            admin_accounts: {
                type: new graphQL.GraphQLList(AccountType),
                resolve: graphQLBookshelf.resolverFactory(models.User)
            }
        }
    });

    let ArticleType = new graphQL.GraphQLObjectType({
        name: 'Article',
        fields: {
            id: {
                type: new graphQL.GraphQLNonNull(graphQL.GraphQLInt)
            },
            is_published: {
                type: graphQL.GraphQLBoolean
            },
            user: {
                type: UserType,
                resolve: graphQLBookshelf.resolverFactory(models.Article)
            },
            title: {
                type: graphQL.GraphQLString
            },
            keywords: {
                type: new graphQL.GraphQLList(graphQL.GraphQLString)
            }
        }
    });

    let RootQuery = new graphQL.GraphQLObjectType({
        name: 'RootQuery',
        fields: {
            articles: {
                type: new graphQL.GraphQLList(ArticleType),
                args: {
                    user_id: {
                        type: graphQL.GraphQLInt
                    },
                    is_published: {
                        type: graphQL.GraphQLBoolean
                    }
                },
                resolve: graphQLBookshelf.resolverFactory(models.Article)
            },
            article: {
                type: ArticleType,
                args: {
                    id: {
                        name: 'id',
                        type: new graphQL.GraphQLNonNull(graphQL.GraphQLInt)
                    }
                },
                resolve: graphQLBookshelf.resolverFactory(models.Article)
            },
            users: {
                type: new graphQL.GraphQLList(UserType),
                resolve: graphQLBookshelf.resolverFactory(models.User)
            },
        }
    });

    return new graphQL.GraphQLSchema({query: RootQuery});
};