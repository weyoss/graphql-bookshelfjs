# graphql-bookshelfjs

## SYNOPSIS

A simple bridge between your graphql queries and your bookshelf models. This library resolves graphql queries which in 
turn resolve into bookshelf queries behind the scenes. It will perform **batched** and **optimised** queries, 
during graphql requests.

## INSTALL

```text
$ npm install --save graphql-bookshelfjs
```

Please make sure you have graphql and bookshelf installed.

## CONFIGURATION

```javascript
graphql( 
    schema, 
    query, 
    null, 
    { 
        loaders: graphQLBookshelf.getLoaders() // include loaders for performing batch queries
    }
)
```

Note: 'loaders' is the only parameter needed to be initialized during graphql setup. 

## USAGE

This example shows how you could setup graphql-bookshelfjs with graphql. We assume that Article has an one-to-one 
(**belongsTo**) relationship with User. User has an many-to-many (**belongsToMany**) relationship with Account, has an 
one-to-one (**hasOne**) relationship with Profile, and has an one-to-many (**hasMany**) with Note. Account model 
determines whether a user is an administrator when access attribute is set to 'admin'.

Bookshelf models:

```javascript
let dbConfig = {
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
let knex = require('knex')(dbConfig);
let bookshelf = require('bookshelf')(knex);

let Article = bookshelf.Model.extend({
    tableName: 'articles',
    user: function () {
        return this.belongsTo(User);
    }
});

let User = bookshelf.Model.extend({
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

let Note = Bookshelf.Model.extend({
    tableName: 'notes'
});

let Account = bookshelf.Model.extend({
    tableName: 'accounts'
});

let Profile = bookshelf.Model.extend({
    tableName: 'profiles'
});
```

Graphql types:

```javascript
let graphQL = require('graphql');
let graphQLBookshelf = require('graphql-bookshelfjs');

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

let ProfileType = new graphQL.GraphQLObjectType({
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

let RootQuery = new graphQL.GraphQLObjectType({
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

Graphql schema:

```javascript
const graphQLSchema = new graphQL.GraphQLSchema({query: RootQuery});
```

Sample client query:

```javascript
let queryString = 
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

Initialize graphql:

```javascript
graphQL.graphql( graphQLSchema, queryString, null, { loaders: graphQLBookshelf.getLoaders() }).then(function(result) {
    console.log( JSON.stringify(result, null, 4) );
});
```

Sample output:

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

Debug log:

```text
{ method: 'select',
  options: {},
  timeout: false,
  cancelOnTimeout: false,
  bindings: [],
  __knexQueryUid: '10f052b5-331d-4746-942d-b6c426126eb3',
  sql: 'select `articles`.* from `articles`' }
{ method: 'select',
  options: {},
  timeout: false,
  cancelOnTimeout: false,
  bindings: [ 55, 66, 66 ],
  __knexQueryUid: '8bff4fa8-96c3-497d-88e5-5b7a4d8bc5f7',
  sql: 'select `users`.* from `users` where `id` in (?, ?, ?)' }
{ method: 'select',
  options: {},
  timeout: false,
  cancelOnTimeout: false,
  bindings: [ 55, 66, 66 ],
  __knexQueryUid: '833761ac-8607-490b-98ab-2d25d3198c65',
  sql: 'select `profiles`.* from `profiles` where `user_id` in (?, ?, ?)' }
{ method: 'select',
  options: {},
  timeout: false,
  cancelOnTimeout: false,
  bindings: [ 55, 66, 66 ],
  __knexQueryUid: '7c4bfd0e-618a-42eb-a1e3-287450735a27',
  sql: 'select `accounts`.*, `users_accounts`.* from `accounts` left join `users_accounts` on `accounts`.`id` = `users_accounts`.`account_id` where `users_accounts`.`user_id` in (?, ?, ?)' }
{ method: 'select',
  options: {},
  timeout: false,
  cancelOnTimeout: false,
  bindings: [ 'admin', 55, 66, 66 ],
  __knexQueryUid: '0dacc8d6-c6b0-43a0-ae21-67b82b3d4dfa',
  sql: 'select `accounts`.*, `users_accounts`.* from `accounts` left join `users_accounts` on `accounts`.`id` = `users_accounts`.`account_id` where `access` = ? and `users_accounts`.`user_id` in (?, ?, ?)' }
{ method: 'select',
  options: {},
  timeout: false,
  cancelOnTimeout: false,
  bindings: [ 55, 66, 66 ],
  __knexQueryUid: '8688e57c-7fbf-4c58-984f-17154d3254b0',
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
               
               // Here we can perform any required action/validation, process args, context, return with rejection, etc.
               // before calling parent resolver
               
               // ...
               
               // let's call the parent resolver
               let parentResolver = graphQLBookshelf.resolverFactory(User);
               return parentResolver(modelInstance, args, context, info);
           }
       }
    }
});
```

### Using 'extra' parameter (from v1.0.2)

Starting from release 1.0.2, 'extra' parameter was added to resolver. Query parameters from client requests are 
automatically translated into where closes. Sometimes we need to execute complex queries (using order by, limit, etc.), 
when dealing with pagination for example. So 'extra' parameter was added to enable us to apply any knex query builder 
method to our bookshelf model. In the listing bellow you can see how you could use 'extra' parameter:
  
```javascript
    let RootQuery = new graphQL.GraphQLObjectType({
        name: 'RootQuery',
        fields: {
            articles: {
                type: new graphQL.GraphQLList(ArticleType),
                args: {
                    user_id: {
                        type: graphQL.GraphQLInt
                    },
                    published: {
                        type: graphQL.GraphQLBoolean
                    },
                    from: {
                        type: graphQL.GraphQLInt
                    },
                    count: {
                        type: graphQL.GraphQLInt
                    },
                },
                resolve: function resolver(modelInstance, args, context, info) {
                    const count = args.count || 5;
                    const extra = {
                        query: [function(db) {
                            db.limit( count );
                        }],
                        orderBy: ['id', 'DESC']
                    };
                    !args.from || (extra.where = ['id', '<', args.from]);
                    
                    // 'from' and 'count' parameters are not model attributes, so let's get rid of them
                    delete args.from;
                    delete args.count;
                    
                    const resolver = graphQLBookshelf.resolverFactory(models.Article);
                    return resolver(modelInstance, args, context, info, extra);
                }
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
knexQueryBuilder.query(function(db) {
    db.limit( count );
});
knexQueryBuilder.orderBy('id', 'DESC');
knexQueryBuilder.where('id', '<', 10045);
```

## BUGS

This library is a work in progress. If you find any bugs, please let me know. Open a 
[issue](https://github.com/weyoss/graphql-bookshelfjs/issues) into github (including the case to reproduce the bug when 
possible).

## SEE ALSO

- [Graphql](http://graphql.org/graphql-js/)
- [Bookshelf](http://bookshelfjs.org/)

## LICENSE

[MIT](https://github.com/weyoss/graphql-bookshelfjs/blob/master/LICENSE)