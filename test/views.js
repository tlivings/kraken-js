'use strict';

process.env.NODE_ENV='_krakendev';

const test = require('tape');
const path = require('path');
const express = require('express');
const request = require('supertest');
const kraken = require('../');

test('views', (t) => {

    t.test('renderer', (t) => {
        function start() {
            function done(err) {
                t.error(err);
                t.end();
            }

            const server = request(app).get('/').expect(200, 'Hello, world!', done);
        }

        const basedir = path.join(__dirname, 'fixtures', 'views');

        const app = express();
        app.use(kraken(basedir));
        app.on('start', start);
        app.on('error', t.error.bind(t));

    });


    t.test('renderer with consolidate', (t) => {
        function start() {
            function done(err) {
                t.error(err);
                t.end();
            }

            const server = request(app).get('/').expect(200, 'Hello, world!', done);
        }

        const options = {
            basedir: path.join(__dirname, 'fixtures', 'views'),
            onconfig(settings, cb) {
                settings.set('express:view engine', 'ejs');
                cb(null, settings);
            }
        };

        const app = express();
        app.use(kraken(options));
        app.on('start', start);
        app.on('error', t.error.bind(t));

    });


    t.test('alt renderer with consolidate', (t) => {
        function start() {
            function done(err) {
                t.error(err);
                t.end();
            }

            const server = request(app).get('/').expect(200, 'Hello, world!', done);
        }

        const options = {
            basedir: path.join(__dirname, 'fixtures', 'views'),
            onconfig(settings, cb) {
                settings.set('express:view engine', 'jade');
                cb(null, settings);
            }
        };

        const app = express();
        app.use(kraken(options));
        app.on('start', start);
        app.on('error', t.error.bind(t));

    });


    t.test('configured renderer function', (t) => {
        function start() {
            function done(err) {
                t.error(err);
                t.end();
            }

            const server = request(app).get('/').expect(200, 'Hello, world!', done);
        }

        const options = {
            basedir: path.join(__dirname, 'fixtures', 'views'),
            onconfig(settings, cb) {
                settings.set('express:view engine', 'dust');
                cb(null, settings);
            }
        };

        const app = express();
        app.use(kraken(options));
        app.on('start', start);
        app.on('error', t.error.bind(t));

    });


    t.test('configured renderer factory function', (t) => {
        function start() {
            function done(err) {
                t.error(err);
                t.end();
            }

            const server = request(app).get('/').expect(200, 'Hello, world!', done);
        }

        const options = {
            basedir: path.join(__dirname, 'fixtures', 'views'),
            onconfig(settings, cb) {
                settings.set('express:view engine', 'htmlx');
                cb(null, settings);
            }
        };

        const app = express();
        app.use(kraken(options));
        app.on('start', start);
        app.on('error', t.error.bind(t));

    });


    t.test('configured renderer exported function', (t) => {
        function start() {
            function done(err) {
                t.error(err);
                t.end();
            }

            const server = request(app).get('/').expect(200, 'Hello, world!', done);
        }

        const options = {
            basedir: path.join(__dirname, 'fixtures', 'views'),
            onconfig(settings, cb) {
                settings.set('express:view engine', 'dustx');
                cb(null, settings);
            }
        };

        const app = express();
        app.use(kraken(options));
        app.on('start', start);
        app.on('error', t.error.bind(t));
    });


    t.test('custom view implementation', (t) => {
        function start() {
            function done(err) {
                t.error(err);
                t.end();
            }

            const server = request(app).get('/').expect(200, 'Hello, world!', done);
        }

        const options = {
            basedir: path.join(__dirname, 'fixtures', 'views'),
            onconfig(settings, cb) {
                settings.set('express:view engine', 'custom');
                cb(null, settings);
            }
        };

        const app = express();
        app.use(kraken(options));
        app.on('start', start);
        app.on('error', t.error.bind(t));
    });


    t.test('built-in shim', (t) => {
        function start() {
            function done(err) {
                t.error(err);
                t.end();
            }

            const server = request(app).get('/').expect(200, 'Hello, world!', done);
        }

        const options = {
            basedir: path.join(__dirname, 'fixtures', 'views'),
            onconfig(settings, cb) {
                settings.set('express:view engine', 'jsp');
                cb(null, settings);
            }
        };

        const app = express();
        app.use(kraken(options));
        app.on('start', start);
        app.on('error', t.error.bind(t));
    });


    t.test('built-in shim with precompiled templates', (t) => {
        function start() {
            function done(err) {
                t.error(err);
                t.end();
            }

            const server = request(app).get('/').expect(200, 'Hello, world!', done);
        }

        const options = {
            basedir: path.join(__dirname, 'fixtures', 'views'),
            onconfig(settings, cb) {
                settings.set('express:view engine', 'class');
                cb(null, settings);
            }
        };

        const app = express();
        app.use(kraken(options));
        app.on('start', start);
        app.on('error', t.error.bind(t));
    });

});
