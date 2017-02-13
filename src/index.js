'use strict';

const loaders = require('./loaders');

module.exports = {

    /**
     *
     * @returns {function}
     */
    getLoaders: function getLoaders() {
        return loaders;
    },

    /**
     *
     * @param {object} target bookshelf model
     * @returns {resolver}
     */
    resolverFactory: function resolverFactory(target) {
        function serialize(collection) {
            function serializeItem(item) {
                const s = item.serialize();
                s._model = item;
                return s;
            }
            if (collection) {
                if (collection.hasOwnProperty('length')) {
                    return collection.map((item) => { return serializeItem(item); });
                }
                return serializeItem(collection);
            }
            return collection;
        }

        return function resolver(modelInstance, args, context, info) {
            const isAssociation = (typeof target.prototype[info.fieldName] === 'function');
            if (isAssociation) {
                const related = modelInstance._model.related(info.fieldName);
                context && context.loaders && context.loaders(related);
                for (const key in args) {
                    related.where(`${related.tableName}.${key}`, args[key]);
                }
                return related.fetch().then((c) => { return serialize(c); });
            }
            const collection = (info.returnType.constructor.name === 'GraphQLList');
            const fn = collection ? 'fetchAll' : 'fetch';
            return target.where(args)[fn]().then((c) => { return serialize(c); });
        };
    },

};
