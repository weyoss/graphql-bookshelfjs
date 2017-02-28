'use strict';

module.exports = function (bookshelf) {
    let Article = bookshelf.model('Article', {
        tableName: 'articles',
        user: function () {
            return this.belongsTo(User);
        }
    });

    let User = bookshelf.model('User', {
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
        }
    });

    let Note = bookshelf.model('Note', {
        tableName: 'notes'
    });

    let Account = bookshelf.model('Account', {
        tableName: 'accounts'
    });

    let Profile = bookshelf.model('Profile', {
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