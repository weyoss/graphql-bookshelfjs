'use strict';

const graphQL = require('graphql');
const graphQLBookshelf = require('graphql-bookshelfjs');

module.exports = function schema(models) {
    const UserType = new graphQL.GraphQLObjectType({
        name: 'User',
        fields: {
            id: {
                type: graphQL.GraphQLString,
            },
            username: {
                type: graphQL.GraphQLString,
            },
        },
    });

    const CommentType = new graphQL.GraphQLObjectType({
        name: 'Comment',
        fields: {
            id: {
                type: graphQL.GraphQLInt,
            },
            body: {
                type: graphQL.GraphQLString,
            },
            posted: {
                type: graphQL.GraphQLString,
            },
            user: {
                type: UserType,
                resolve: graphQLBookshelf.resolverFactory(models.Comment),
            },
        },
    });

    const ArticleType = new graphQL.GraphQLObjectType({
        name: 'Article',
        fields: {
            id: {
                type: new graphQL.GraphQLNonNull(graphQL.GraphQLInt),
            },
            published: {
                type: graphQL.GraphQLBoolean,
            },
            title: {
                type: graphQL.GraphQLString,
            },
            body: {
                type: graphQL.GraphQLString,
            },
            posted: {
                type: graphQL.GraphQLString,
            },
            user: {
                type: UserType,
                resolve: graphQLBookshelf.resolverFactory(models.Article),
            },
            comments: {
                type: new graphQL.GraphQLList(CommentType),
                args: {
                    from: {
                        type: graphQL.GraphQLInt,
                    },
                    count: {
                        type: graphQL.GraphQLInt,
                    },
                },
                resolve: function resolver(modelInstance, args, context, info) {
                    const count = args.count || 5;
                    const extra = {
                        query: [function (db) {
                            db.limit(count);
                        }],
                        orderBy: ['id', 'DESC'],
                    };
                    !args.from || (extra.where = ['id', '<', args.from]);

                    // 'from' and 'count' parameters are not model attributes, so let's get rid of them
                    delete args.from;
                    delete args.count;

                    const resolverFn = graphQLBookshelf.resolverFactory(models.Article);
                    return resolverFn(modelInstance, args, context, info, extra);
                },
            },
        },
    });

    const RootQuery = new graphQL.GraphQLObjectType({
        name: 'RootQuery',
        fields: {
            articles: {
                type: new graphQL.GraphQLList(ArticleType),
                args: {
                    user_id: {
                        type: graphQL.GraphQLInt,
                    },
                    published: {
                        type: graphQL.GraphQLBoolean,
                    },
                    from: {
                        type: graphQL.GraphQLInt,
                    },
                    count: {
                        type: graphQL.GraphQLInt,
                    },
                },
                resolve: function resolver(modelInstance, args, context, info) {
                    const count = args.count || 5;
                    const extra = {
                        query: [function (db) {
                            db.limit(count);
                        }],
                        orderBy: ['id', 'DESC'],
                    };
                    !args.from || (extra.where = ['id', '<', args.from]);

                    // 'from' and 'count' parameters are not model attributes, so let's get rid of them
                    delete args.from;
                    delete args.count;

                    const resolverFn = graphQLBookshelf.resolverFactory(models.Article);
                    return resolverFn(modelInstance, args, context, info, extra);
                },
            },
        },
    });

    return new graphQL.GraphQLSchema({ query: RootQuery });
};
