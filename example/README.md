# Example

## INSTALLATION & CONFIGURATION

To get started, please copy example directory to some place in your home folder and follow the instructions bellow.

```text
$ cd example
$ npm install
$ ./node_modules/.bin/knex migrate:latest
$ ./node_modules/.bin/knex seed:run
```

## USAGE
```text
$ node index
```

Sample output:

```text
{ method: 'select',
  options: {},
  timeout: false,
  cancelOnTimeout: false,
  bindings: [ true, 5, 3 ],
  __knexQueryUid: 'f47c490a-6227-4454-b798-adc4ade30d25',
  sql: 'select "articles".* from "articles" where "articles"."published" = ? and "id" < ? order by "articles"."id" DESC limit ?' }
{ method: 'select',
  options: {},
  timeout: false,
  cancelOnTimeout: false,
  bindings: [ 3, 1 ],
  __knexQueryUid: '293c0083-61b9-4e0d-ad61-479afebad949',
  sql: 'select "users".* from "users" where "id" in (?, ?)' }
{ method: 'select',
  options: {},
  timeout: false,
  cancelOnTimeout: false,
  bindings: [ 4, 1, 2 ],
  __knexQueryUid: 'f850c1c1-5d2e-477b-8241-6eec039e4a32',
  sql: 'select "comments".* from "comments" where "article_id" in (?, ?) order by "comments"."id" DESC limit ?' }
{ method: 'select',
  options: {},
  timeout: false,
  cancelOnTimeout: false,
  bindings: [ 6, 1 ],
  __knexQueryUid: '3a189fe6-6b26-4a43-869d-6cf9713c95c0',
  sql: 'select "users".* from "users" where "id" in (?, ?)' }
{
    "data": {
        "articles": [
            {
                "id": 4,
                "title": "GraphQL.js",
                "posted": "2017-01-03 22:27:01",
                "user": {
                    "id": "3",
                    "username": "user3"
                },
                "comments": []
            },
            {
                "id": 1,
                "title": "Knex.js",
                "posted": "2017-02-05 18:21:59",
                "user": {
                    "id": "1",
                    "username": "user1"
                },
                "comments": [
                    {
                        "id": 6,
                        "body": "this is very well presented and accurate !!!",
                        "posted": "2017-03-07 18:40:06",
                        "user": {
                            "id": "6",
                            "username": "user6"
                        }
                    },
                    {
                        "id": 1,
                        "body": "What a great presentation! A pleasure to watch. Thank you!",
                        "posted": "2017-03-04 18:13:56",
                        "user": {
                            "id": "1",
                            "username": "user1"
                        }
                    }
                ]
            }
        ]
    }
}
```