'use strict';

module.exports = function (bookshelf) {
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
        admin_accounts: function () {
            return this.belongsToMany(Account, 'users_accounts').query({where: {access: 'admin'}});
        },
        profile: function () {
            return this.hasOne(Profile);
        },
        articles: function () {
            return this.hasMany(Article);
        }
    });

    let Note = bookshelf.Model.extend({
        tableName: 'notes'
    });

    let Account = bookshelf.Model.extend({
        tableName: 'accounts'
    });

    let Profile = bookshelf.Model.extend({
        tableName: 'profiles'
    });

    return {
        User,
        Note,
        Account,
        Profile,
        Article
    }
};
