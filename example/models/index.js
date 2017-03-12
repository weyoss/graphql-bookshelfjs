'use strict';

module.exports = function models(bookshelf) {
    let User = bookshelf.Model.extend({
        tableName: 'users',
    });
    let Comment = bookshelf.Model.extend({
        tableName: 'comments',
        user: function () {
            return this.belongsTo(User);
        }
    });
    let Article = bookshelf.Model.extend({
        tableName: 'articles',
        user: function () {
            return this.belongsTo(User);
        },
        comments: function () {
            return this.hasMany(Comment);
        }
    });
    return {
        User,
        Article,
        Comment
    }
};