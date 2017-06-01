'use strict';

const comments = [
    {
        body: 'What a great presentation! A pleasure to watch. Thank you!',
        posted: '2017-03-04 18:13:56',
        user_id: 1,
        article_id: 1,
    },
    {
        body: `Lloyd would be proud to hear his own words presented in such an excellent presentation.
               A superb memorial!`,
        posted: '2017-03-05 10:20:04',
        user_id: 2,
        article_id: 2,
    },
    {
        body: 'great sound quality. very nice presentation',
        posted: '2017-03-05 19:01:16',
        user_id: 3,
        article_id: 2,
    },
    {
        body: 'This information is mind candy and soul food. Keep em coming. Love, Anthony.',
        posted: '2017-03-05 19:20:34',
        user_id: 4,
        article_id: 3,
    },
    {
        body: 'Brilliant. Thanks for the upload!',
        posted: '2017-03-06 15:43:23',
        user_id: 5,
        article_id: 6,
    },
    {
        body: 'this is very well presented and accurate !!!',
        posted: '2017-03-07 18:40:06',
        user_id: 6,
        article_id: 1,
    },

];

exports.seed = function seed(knex, Promise) {
    const promises = comments.map((comment) => {
        return knex.table('comments').insert(comment);
    });
    return Promise.all(promises);
};
