'use strict';

const config = {
    "client": "mysql",
    debug: false
};

const knex = require('knex');
const mockKnex = require('mock-knex');
const tracker = mockKnex.getTracker();

const connection = knex(config);
mockKnex.mock(connection);

const bookshelf = require('bookshelf')(connection);
const models = require('./../common/models')(bookshelf);
const graphQLSchema = require('./../common/schema')(models);

const sinon = require('sinon');

before(function(done) {
    this.sandbox = sinon.sandbox.create();
    this.sandbox.graphQLSchema = graphQLSchema;
    this.sandbox.tracker = tracker;
    done();
});

beforeEach(function (done) {
    this.sandbox.restore();
    this.sandbox.tracker.install();
    done();
});

afterEach(function (done) {
    this.sandbox.tracker.uninstall();
    done();
});