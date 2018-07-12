'use strict';

const DataLoader = require('dataloader');
const shimmer = require('shimmer');

/**
 *
 * @type {!object}
 */
let context;

/**
 *
 * @param {string} key
 * @returns {(DataLoader|boolean)}
 */
function getLoader(key) {
    context.loaders = context.loaders || {};
    if (context.loaders.hasOwnProperty(key)) {
        return context.loaders[key];
    }
    return false;
}

/**
 *
 * @param {string} key
 * @param {DataLoader} loader
 */
function setLoader(key, loader) {
    context.loaders = context.loaders || {};
    context.loaders[key] = loader;
}

/**
 *
 * @param {object} model
 * @param {string} targetIdAttribute
 * @param {string} relationType
 * @param {?object} queryBuilder
 * @returns {DataLoader}
 */
function modelLoader(model, targetIdAttribute, relationType, queryBuilder) {
    const loaderKey = [
        model.prototype.tableName,
        targetIdAttribute,
        relationType,
        queryBuilder ? queryBuilder.toString() : '0',
    ].join('|');

    let loader = getLoader(loaderKey);
    if (!loader) {
        const collection = (relationType === 'hasMany');
        loader = new DataLoader((keys) => {
            return model.query((db) => {
                Object.assign(db, queryBuilder || {});
                db.where(targetIdAttribute, 'in', keys);
            }).fetchAll().then((items) => {
                const byTargetId = {};
                items.forEach((item) => {
                    if (collection) {
                        const key = item.attributes[targetIdAttribute];
                        byTargetId[key] = byTargetId[key] ?
                            byTargetId[key] :
                            [];
                        byTargetId[key].push(item);
                    } else byTargetId[item.attributes[targetIdAttribute]] = item;
                });
                return keys.map((key) => {
                    if (byTargetId.hasOwnProperty(key)) {
                        return byTargetId[key];
                    }
                    if (collection === true) {
                        return [];
                    }
                    return null;
                });
            });
        }, {
            cache: false,
        });
        setLoader(loaderKey, loader);
    }
    return loader;
}

/**
 *
 * @param {object} model
 * @param {string} joinTableName
 * @param {string} foreignKey
 * @param {string} otherKey
 * @param {string} targetIdAttribute
 * @param {?object} queryBuilder
 * @returns {DataLoader}
 */
function belongsToManyLoader(model, joinTableName, foreignKey, otherKey, targetIdAttribute, queryBuilder) {
    const loaderKey = [
        model.prototype.tableName,
        joinTableName,
        foreignKey,
        otherKey,
        targetIdAttribute,
        queryBuilder ? queryBuilder.toString() : '0',
    ].join('|');
    let loader = getLoader(loaderKey);
    if (!loader) {
        loader = new DataLoader((keys) => {
            return model.query((db) => {
                Object.assign(db, queryBuilder || {});
                db.select([
                    `${model.prototype.tableName}.*`,
                    `${joinTableName}.${foreignKey}`,
                    `${joinTableName}.${otherKey}`,
                ]).innerJoin(
                    joinTableName, `${model.prototype.tableName}.${targetIdAttribute}`,
                    '=',
                    `${joinTableName}.${otherKey}`)
                .where(`${joinTableName}.${foreignKey}`, 'in', keys);
            })
            .fetchAll()
            .then((items) => {
                const byForeignKey = {};
                items.forEach((item) => {
                    const key = item.attributes[foreignKey];
                    byForeignKey[key] = byForeignKey[key] ?
                        byForeignKey[key] :
                        [];
                    byForeignKey[key].push(item);
                });
                return keys.map((key) => {
                    if (byForeignKey.hasOwnProperty(key)) {
                        return byForeignKey[key];
                    }
                    return [];
                });
            });
        }, {
            cache: false,
        });
        setLoader(loaderKey, loader);
    }
    return loader;
}

/**
 *
 * @param {object} target
 */
function belongsTo(target) {
    if (target.fetch.__wrapped) return;
    shimmer.wrap(target, 'fetch', (original) => {
        return function fetch() {
            const model = this.relatedData.target;
            const targetIdAttribute = this.relatedData.key('targetIdAttribute');
            const parentFK = this.relatedData.key('parentFk');
            const knex = this._knex;
            return (parentFK !== null) ?
                modelLoader(model, targetIdAttribute, 'belongsTo', knex).load(parentFK) :
                Promise.resolve(null);
        };
    });
}

/**
 *
 * @param {object} target
 */
function hasOne(target) {
    if (target.fetch.__wrapped) return;
    shimmer.wrap(target, 'fetch', (original) => {
        return function fetch() {
            const model = this.relatedData.target;
            const foreignKey = this.relatedData.key('foreignKey');
            const parentFK = this.relatedData.key('parentFk');
            const knex = this._knex;
            return modelLoader(model, foreignKey, 'hasOne', knex).load(parentFK);
        };
    });
}

/**
 *
 * @param {object} target
 */
function hasMany(target) {
    if (target.fetch.__wrapped) return;
    shimmer.wrap(target, 'fetch', (original) => {
        return function fetch() {
            const model = this.relatedData.target;
            const foreignKey = this.relatedData.key('foreignKey');
            const parentFK = this.relatedData.key('parentFk');
            const knex = this._knex;
            return modelLoader(model, foreignKey, 'hasMany', knex).load(parentFK);
        };
    });
}

/**
 *
 * @param {object} target
 */
function belongsToMany(target) {
    if (target.fetch.__wrapped) return;
    shimmer.wrap(target, 'fetch', (original) => {
        return function fetch() {
            const model = this.relatedData.target;
            const joinTableName = this.relatedData.key('joinTableName') ||
                [this.tableName(), this.relatedData.key('parentTableName')].sort().join('_');
            const foreignKey = this.relatedData.key('foreignKey');
            const otherKey = this.relatedData.key('otherKey');
            const targetIdAttribute = this.relatedData.key('targetIdAttribute');
            const parentFK = this.relatedData.key('parentFk');
            const knex = this._knex;
            return belongsToManyLoader(model, joinTableName, foreignKey, otherKey, targetIdAttribute, knex)
                .load(parentFK);
        };
    });
}

/**
 *
 * @param {object} target
 */
module.exports = function loaders(target) {
    context = this;
    context.__bookshelfResolver = context.__bookshelfResolver || {};
    context = context.__bookshelfResolver;
    if (target.relatedData) {
        switch (target.relatedData.type) {
        case 'belongsTo':
            belongsTo(target);
            break;

        case 'belongsToMany':
            belongsToMany(target);
            break;

        case 'hasMany':
            hasMany(target);
            break;

        case 'hasOne':
            hasOne(target);
            break;

        default:
            break;
        }
    }
};
