# graphql-bookshelfjs

## SYNOPSIS

A simple bridge between your graphql queries and your bookshelf models. This library resolves graphql queries to 
**batched** and **optimised** queries using bookshelf models.

## INSTALL

```text
$ npm install --save graphql-bookshelfjs
```

Please make sure you have graphql and bookshelf installed.

## CONFIGURATION

There are 2 configuration steps:

1. At the level of your GraphQL schema and resolve functions, you should provide the resolver which will be called by
the GraphQL engine for actually querying the data.

```javascript
const graphQL = require('graphql');
const graphQLBookshelf = require('graphql-bookshelfjs');

const RootQuery =  new graphQL.GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        field: {
            // ...

            resolve: graphQLBookshelf.resolverFactory( SomeBookshelfModel ) // Provide the resolver
        },
    }
});
const graphQLSchema = new graphQL.GraphQLSchema({query: RootQuery});
```

2. At the level of GraphQL query execution, include the data loaders in the context object for performing batch queries.

```javascript
const someQueryString = '...';
graphQL.graphql(graphQLSchema, someQueryString, null, {
        loaders: graphQLBookshelf.getLoaders() // include the loaders
    }).then(function(result) {
        // ...
    });
```

## USAGE

### EXAMPLE

If you're new to the GraphQL ecosystem and have troubles getting a project up and running or maybe you are confused
about how to use this library then check out the [EXAMPLE FOLDER](https://github.com/weyoss/graphql-bookshelfjs/blob/master/example)
to get started.

### HOW-TO — STEP BY STEP

Let's assume: 

- We have 4 models: Article, User, Account and Note.
- Article has a **one-to-one** (belongsTo) relationship with User.
- User has a **many-to-many** (belongsToMany) relationship with Account.
- User has a **one-to-one** (hasOne) relationship with Profile. 
- User has a **one-to-many** (hasMany) relationship with Note.
- A user account has Administrator privileges when access attribute is set to 'admin'.

#### BOOKSHELF MODELS

```javascript
const knex = require('knex')(dbConfig);
const bookshelf = require('bookshelf')(knex);

const dbConfig = {
    "client": "mysql",
    "connection": {
        "host": "127.0.0.1",
        "user": "root",
        "password": null,
        "database": "mydatabase",
        "charset": "utf8"
    },
    debug: true
};

const Article = bookshelf.Model.extend({
    tableName: 'articles',
    user: function () {
        return this.belongsTo(User);
    }
});

const User = bookshelf.Model.extend({
    tableName: 'users',
    notes: function () {
       return this.hasMany(Note);
    },
    accounts: function () {
       return this.belongsToMany(Account, 'users_accounts');
    },
    adminAccounts: function () {
       return this.belongsToMany(Account, 'users_accounts').query({where: {access: 'admin'}});
    },
    profile: function () {
       return this.hasOne(Profile);
    }
});

const Note = Bookshelf.Model.extend({
    tableName: 'notes'
});

const Account = bookshelf.Model.extend({
    tableName: 'accounts'
});

const Profile = bookshelf.Model.extend({
    tableName: 'profiles'
});
```

#### DEFINNING GRAPHQL TYPES

```javascript
const graphQL = require('graphql');
const graphQLBookshelf = require('graphql-bookshelfjs');

let ArticleType = new graphQL.GraphQLObjectType({
    name: 'Article',
    fields: {
        id: {
            type: new graphQL.GraphQLNonNull(graphQL.GraphQLInt)
        },
        isPublished: {
            type: graphQL.GraphQLBoolean
        },
        user: {
            type: UserType,
            resolve: graphQLBookshelf.resolverFactory(Article)
        },
        title: {
            type: graphQL.GraphQLString
        },
        keywords: {
            type: new graphQL.GraphQLList(graphQL.GraphQLString)
        }
    }
});

const UserType = new graphQL.GraphQLObjectType({
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
           resolve: graphQLBookshelf.resolverFactory(User)
       },
       notes: {
           type: new graphQL.GraphQLList(NoteType),
           resolve: graphQLBookshelf.resolverFactory(User)
       },
       accounts: {
           type: new graphQL.GraphQLList(AccountType),
           resolve: graphQLBookshelf.resolverFactory(User)
       },
       adminAccounts: {
           type: new graphQL.GraphQLList(AccountType),
           resolve: graphQLBookshelf.resolverFactory(User)
       }
    }
});
const ProfileType = new graphQL.GraphQLObjectType({
    name: 'Profile',
    fields: {
        id: {
            type: graphQL.GraphQLInt
        },
        firstName: {
            type: graphQL.GraphQLString
        },
        lastName: {
            type: graphQL.GraphQLString
        },
        birthday: {
            type: graphQL.GraphQLString
        }
    }
});

const AccountType = new graphQL.GraphQLObjectType({
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

const NoteType = new graphQL.GraphQLObjectType({
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

const RootQuery = new graphQL.GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        articles: {
            type: new graphQL.GraphQLList(ArticleType),
            args: {
                userId: {
                    type: graphQL.GraphQLInt
                },
            },
            resolve: graphQLBookshelf.resolverFactory( Article )
        },
        article: {
            type: ArticleType,
            args: {
                id: {
                    name: 'id',
                    type: new graphQL.GraphQLNonNull(graphQL.GraphQLInt)
                }
            },
            resolve: graphQLBookshelf.resolverFactory( Article )
        }
    }
});
```

#### GRAPHQL SCHEMA

```javascript
const graphQLSchema = new graphQL.GraphQLSchema({query: RootQuery});
```

#### GRAPHQL QUERY

```javascript
const queryString =
`{ 
    articles { 
        title, 
        user { 
            id,
            name, 
            profile {
                firstName,
                lastName,
                birthday
            }
            accounts {
                id, 
                name
            },  
            adminAccounts {
                id, 
                name
            }, 
            notes {
                id,
                note 
            } 
        } 
    } 
}`;
```

#### GRAPHQL QUERY EXECUTION

```javascript
graphQL.graphql( graphQLSchema, queryString, null, { loaders: graphQLBookshelf.getLoaders() }).then(function(result) {
    console.log( JSON.stringify(result, null, 4) );
});
```

#### OUTPUT SAMPLE

```text
{
    "data": {
       "articles": [
           {
               "title": "qwerty2",
               "user": {
                   "id": 66,
                   "name": "Tom Stevens",
                   "profile": {
                       "firstName": Tom,
                       "lastName": Stevens,
                       "birthday": "1970-02-24"
                   },
                   "accounts": [
                       {
                           "id": 1,
                           "name": "Viewer account"
                       },
                       {
                           "id": 2,
                           "name": "Admin account"
                       }
                   ],
                   "adminAccounts": [
                       {
                           "id": 2,
                           "name": "Admin account"
                       }
                   ],
                   "notes": [
                       {
                           "id": 345,
                           "note": "qwerty"
                       },
                       {
                           "id": 346,
                           "note": "asdf"
                       },
                       {
                           id: 347,
                           "note": "zxcvb"
                       }
                   ]
               }
           },
           ...
       ]
   }
}
```

#### DEBUG LOG

```text
{ ...
  bindings: [],
  sql: 'select `articles`.* from `articles`' }
{ ...
  bindings: [ 55, 66, 66 ],
  sql: 'select `users`.* from `users` where `id` in (?, ?, ?)' }
{ ...
  bindings: [ 55, 66, 66 ],
  sql: 'select `profiles`.* from `profiles` where `user_id` in (?, ?, ?)' }
{ ...
  bindings: [ 55, 66, 66 ],
  sql: 'select `accounts`.*, `users_accounts`.* from `accounts` left join `users_accounts` on `accounts`.`id` = `users_accounts`.`account_id` where `users_accounts`.`user_id` in (?, ?, ?)' }
{ ...
  bindings: [ 'admin', 55, 66, 66 ],
  sql: 'select `accounts`.*, `users_accounts`.* from `accounts` left join `users_accounts` on `accounts`.`id` = `users_accounts`.`account_id` where `access` = ? and `users_accounts`.`user_id` in (?, ?, ?)' }
{ ...
  bindings: [ 55, 66, 66 ],
  sql: 'select `notes`.* from `notes` where `user_id` in (?, ?, ?)' }

```
## ADVANCED USAGE

```javascript
let UserType = new graphQL.GraphQLObjectType({
    name: 'User',
    fields: {
       id: {
           type: graphQL.GraphQLString
       },
       
       // ...
       
       adminAccounts: {
           type: new graphQL.GraphQLList(AccountType),
           resolve: function resolver(modelInstance, args, context, info) {
               
               // Before invoking graphQLBookshelf.resolverFactory() and returning a resolver, any actions or
               // validation rules can be performed and if for some reason something went wrong we can just return a
               // Promise.reject('something_went_wrong') for example.
               
               // ...
               
               // Everything is OK, so let's call the parent resolver
               let parentResolver = graphQLBookshelf.resolverFactory(User);
               return parentResolver(modelInstance, args, context, info);
           }
       }
    }
});
```

### USING 'extra' PARAMETER

Starting from release 1.0.2, `extra` parameter was added to resolver.

Query parameters from client requests are automatically translated into where closes. Sometimes we need to have more 
control of our models using complex queries (when dealing with pagination for example). With the help of 'extra' 
parameter we can apply any knex query builder method to our bookshelf model. 

`extra` parameter is optional. When provided, it should be either a function or an object. The listing bellow
demonstrates how it can be used:
  
```javascript
let RootQuery = new graphQL.GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        articles: {

            // ...

            resolve: function resolver(modelInstance, args, context, info) {
                /*
                // Defining extra using an object
                const count = args.count || 5;
                const extra = {
                    query: [function (db) {
                        db.limit(count);
                    }],
                    orderBy: ['id', 'DESC'],
                };
                !args.from || (extra.where = ['id', '<', args.from]);
                */

                // Defining extra using a function
                const { count = 5, from } = args;
                const extra = (model) => {
                    model.query((db) => {
                        db.limit(count);
                    });
                    model.orderBy('id', 'DESC');
                    if (from) model.where('id', '<', from);
                };

                // 'from' and 'count' parameters are not model attributes, so let's get rid of them
                const filteredArgs = _.omit(args, ['count', 'from']);

                const resolverFn = graphQLBookshelf.resolverFactory(models.Article);
                return resolverFn(modelInstance, filteredArgs, context, info, extra);
            },
        },
    }
});
```

To make it more clear, the following:

```javascript
const extra = {
    query: [function(db) {
        db.limit( 5 );
    }],
    orderBy: ['id', 'DESC'],
    where: ['id', '<', 10045]
};
```

is the same as: 

```javascript
const knexQueryBuilder = model.query();
knexQueryBuilder.query(function(db) {
    db.limit( count );
});
knexQueryBuilder.orderBy('id', 'DESC');
knexQueryBuilder.where('id', '<', 10045);
```

For the sake of simplicity defining `extra` using a function is recommended to be used instead of using an object. It
is more clear and intuitive.

## CONTRIBUTING

So you are interested in contributing to this project? Please see [CONTRIBUTING.md](https://github.com/weyoss/guidelines/blob/master/CONTRIBUTIONS.md).

## SEE ALSO

- [Graphql](http://graphql.org/graphql-js/)
- [Bookshelf](http://bookshelfjs.org/)

## LICENSE

[MIT](https://github.com/weyoss/graphql-bookshelfjs/blob/master/LICENSE)
