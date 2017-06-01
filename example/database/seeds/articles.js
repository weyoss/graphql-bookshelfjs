'use strict';

const articles = [
    {
        title: 'Knex.js',
        body: `Knex.js is a "batteries included" SQL query builder for Postgres, MSSQL, MySQL, MariaDB, SQLite3, and 
               Oracle designed to be flexible, portable, and fun to use.`,
        posted: '2017-02-05 18:21:59',
        published: true,
        user_id: 1,
    },
    {
        title: 'Bookshelf.js',
        body: `Bookshelf is a JavaScript ORM for Node.js, built on the Knex SQL query builder. Featuring both promise 
               based and traditional callback interfaces, providing transaction support, eager/nested-eager relation 
               loading, polymorphic associations, and support for one-to-one, one-to-many, and many-to-many relations.`,
        posted: '2017-02-09 12:47:59',
        published: false,
        user_id: 1,
    },
    {
        title: 'SQLite',
        body: `SQLite is a self-contained database engine which require no server to run (for MySQL,Oracle we require 
               Database Server). SQLite is most popular in developing mobile apps and it is consider as most widely 
               deployed database engine in the world.`,
        posted: '2017-02-09 00:47:55',
        published: false,
        user_id: 2,
    },
    {
        title: 'GraphQL.js',
        body: 'The JavaScript reference implementation for GraphQL, a query language for APIs created by Facebook.',
        posted: '2017-01-03 22:27:01',
        published: true,
        user_id: 3,
    },
    {
        title: 'Random gibberish text to use in web pages',
        body: `Is post each that just leaf no. He connection interested so we an sympathize advantages. To said is it 
               shed want do. Occasional middletons everything so to. Have spot part for his quit may. Enable it is 
               square my an regard. Often merit stuff first oh up hills as he. Servants contempt as although addition 
               dashwood is procured. Interest in yourself an do of numerous feelings cheerful confined.`,
        posted: '2017-03-08 15:47:17',
        published: true,
        user_id: 3,
    },
    {
        title: 'Get rid of Lorem Ipsum forever',
        body: `Not far stuff she think the jokes. Going as by do known noise he wrote round leave. Warmly put branch 
               people narrow see. Winding its waiting yet parlors married own feeling. Marry fruit do spite jokes an 
               times. Whether at it unknown warrant herself winding if. Him same none name sake had post love. An busy 
               feel form hand am up help. Parties it brother amongst an fortune of. Twenty behind wicket why age now 
               itself ten.`,
        posted: '2017-01-01 18:11:06',
        published: true,
        user_id: 3,
    },
    {
        title: 'A tool for web designers who want to save time',
        body: `Improve him believe opinion offered met and end cheered forbade. Friendly as stronger speedily by 
               recurred. Son interest wandered sir addition end say. Manners beloved affixed picture men ask. Explain 
               few led parties attacks picture company. On sure fine kept walk am in it. Resolved to in believed 
               desirous unpacked weddings together. Nor off for enjoyed cousins herself. Little our played lively she 
               adieus far sussex. Do theirs others merely at temper it nearer.`,
        posted: '2017-01-13 02:14:33',
        published: true,
        user_id: 4,
    },
];

exports.seed = function seed(knex, Promise) {
    const promises = articles.map((article) => {
        return knex.table('articles').insert(article);
    });
    return Promise.all(promises);
};
