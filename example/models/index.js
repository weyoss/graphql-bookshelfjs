'use strict';

module.exports = function models(bookshelf) {
    const User = bookshelf.Model.extend({
        tableName: 'users',
    });

    const Comment = bookshelf.Model.extend({
        tableName: 'comments',
        user() {
            return this.belongsTo(User);
        },
    });

    const Article = bookshelf.Model.extend({
        tableName: 'articles',
        user() {
            return this.belongsTo(User);
        },
        comments() {
            return this.hasMany(Comment);
        },
    });

    return {
        User,
        Article,
        Comment,
    };
};
