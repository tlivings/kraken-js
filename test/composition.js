'use strict';

process.env.NODE_ENV='_krakendev';

const test = require('tape');
const path = require('path');
const express = require('express');
const request = require('supertest');
const kraken = require('../');


test('composition', (t) => {

    const SETTINGS = [ 'x-powered-by', 'etag', 'env', 'query parser', 'subdomain offset', 'trust proxy',
                     'jsonp callback name', 'case sensitive routing', 'strict routing', 'query parser fn'];

    t.test('plugin', (t) => {
        const args = {
            onstart() {
                const child = this;

                // Compare settings to ensure they are inherited correctly.
                t.notEqual(child.get('views'), parent.get('views'));
                t.notEqual(child.kraken.get('express:views'), parent.kraken.get('express:views'));

                SETTINGS.forEach(function (name) {
                    t.equal(child.get(name), parent.get(name), 'Expected \'' + name + '\' to be equal.');
                });

                request(parent)
                    .get('/')
                    .expect(200)
                    .expect('Hello, world!', function done(err) {
                        t.error(err);
                        t.end();
                    });
            },
            onmount: Function.prototype
        };

        const options = {
            basedir: path.join(__dirname, 'fixtures', 'settings'),
            onconfig(config, next) {
                config.set('middleware:plugin', {
                    enabled: true,
                    priority: 119,
                    module: {
                        name: path.join(__dirname, 'fixtures', 'settings', 'lib', 'plugin'),
                        arguments: [args]
                    }
                });
                next(null, config);
            }
        };

        const parent = express();
        parent.use(kraken(options));
        parent.on('error', t.error.bind(t));
    });


    t.test('plugin with mountpath', (t) => {
        const args = {
            onstart() {
                const child = this;

                // Compare settings to ensure they are inherited correctly.
                t.notEqual(child.get('views'), parent.get('views'));
                t.notEqual(child.kraken.get('express:views'), parent.kraken.get('express:views'));
                SETTINGS.forEach(function (name) {
                    t.equal(child.get(name), parent.get(name), 'Expected \'' + name + '\' to be equal.');
                });

                request(parent)
                    .get('/plugin')
                    .expect(200)
                    .expect('Hello, world!', function done(err) {
                        t.error(err);
                        t.end();
                    });
            },
            onmount: Function.prototype
        };

        const options = {
            basedir: path.join(__dirname, 'fixtures', 'settings'),
            onconfig: function (config, next) {
                config.set('middleware:plugin', {
                    enabled: true,
                    priority: 119,
                    route: '/plugin',
                    module: {
                        name: path.join(__dirname, 'fixtures', 'settings', 'lib', 'plugin'),
                        arguments: [args]
                    }
                });
                next(null, config);
            }
        };

        const parent = express();
        parent.use(kraken(options));
        parent.on('error', t.error.bind(t));
    });


    t.test('inherited views', (t) => {
        const args = {
            onstart() {
                const child = this;

                // Compare settings to ensure they are inherited correctly.
                t.equal(child.get('views'), parent.get('views'));
                t.equal(child.kraken.get('express:views'), parent.kraken.get('express:views'));
                SETTINGS.forEach(function (name) {
                    t.equal(child.get(name), parent.get(name), 'Expected \'' + name + '\' to be equal.');
                });

                request(parent)
                    .get('/plugin')
                    .expect(200)
                    .expect('Hello, world!', function done(err) {
                        t.error(err);
                        t.end();
                    });
            },
            onmount: Function.prototype,
            inheritViews: true
        };

        const options = {
            basedir: path.join(__dirname, 'fixtures', 'settings'),
            onconfig(config, next) {
                config.set('middleware:plugin', {
                    enabled: true,
                    priority: 119,
                    route: '/plugin',
                    module: {
                        name: path.join(__dirname, 'fixtures', 'settings', 'lib', 'plugin'),
                        arguments: [args]
                    }
                });
                next(null, config);
            }
        };

        const parent = express();
        parent.use(kraken(options));
        parent.on('error', t.error.bind(t));
    });


    t.test('late mounting', function () {
        let parent = undefined;

        const args = {
            onstart() {

                // After the child has started, mount the application and make requests.
                parent = express();
                parent.use('/plugin', this);

                request(parent)
                    .get('/plugin')
                    .expect(200)
                    .expect('Hello, world!', function done(err) {
                        t.error(err);
                        t.end();
                    });
            },
            onmount(parent) {
                // Compare settings to ensure they are inherited correctly.
                // Not checking all settings because child kraken app intentionally
                // overrides some settings by default.
                t.notEqual(this.get('views'), parent.get('views'));
                t.notEqual(this.kraken.get('express:views'), parent.get('views'));
            }
        };

        const factory = require('./fixtures/settings/lib/plugin');
        factory(args);
    });

});
