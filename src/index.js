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
     * @param {Object} Target
     * @returns {function}
     */
    resolverFactory: function resolverFactory(Target) {
        function serialize(collection) {
            function serializeItem(item) {
                // quick fix, allowing to both resolvers to get actual model instances and
                // to GraphQL to access model attributes
                return Object.assign(item, item.serialize({ shallow: true }));
            }
            if (collection) {
                if (collection.hasOwnProperty('length')) {
                    return collection.map((item) => { return serializeItem(item); });
                }
                return serializeItem(collection);
            }
            return collection;
        }

        return function resolver(modelInstance, args, context, info, extra) {
            const isAssociation = (typeof Target.prototype[info.fieldName] === 'function');
            const model = isAssociation ? modelInstance.related(info.fieldName) : new Target();
            for (const key in args) {
                model.where(`${model.tableName}.${key}`, args[key]);
            }
            if (extra) {
                for (const key in extra) {
                    model[key](...extra[key]);
                    delete extra.key;
                }
            }
            if (isAssociation) {
                context && context.loaders && context.loaders(model);
                return model.fetch().then((c) => { return serialize(c); });
            }
            const fn = (info.returnType.constructor.name === 'GraphQLList') ? 'fetchAll' : 'fetch';
            return model[fn]().then((c) => { return serialize(c); });
        };
    },

};
