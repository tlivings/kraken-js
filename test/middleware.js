'use strict';

process.env.NODE_ENV='_krakendev';

const test = require('tape');
const path = require('path');
const express = require('express');
const request = require('supertest');
const kraken = require('../');

test('middleware', (t) => {

    t.test('no config', (t) => {
        const options = {
            basedir: path.join(__dirname, 'fixtures', 'middleware'),
            onconfig(settings, cb) {
                settings.set('middleware', null);
                cb(null, settings);
            }
        };

        const app = express();
        app.on('start', t.end.bind(t));
        app.on('error', t.error.bind(t));
        app.use(kraken(options));
    });


    t.test('multipart', (t) => {
        t.plan(8);

        function start() {
            t.pass('server started');

            const file = path.join(__dirname, 'fixtures', 'middleware', 'public', 'img', 'lazerz.jpg');
            let server = request(app).post('/').attach('file', file).expect(200, (err) => {
                // support for multipart requests
                t.error(err, 'server is accepting requests');

                // trololol
                server = request(app).get('/').expect(200, (err) => {
                    // support for non-multipart requests
                    t.error(err);
                    t.end();
                });
            });
        }

        function error(err) {
            t.error(err, 'server startup failed');
            t.end();
        }

        const basedir = path.join(__dirname, 'fixtures', 'middleware');

        const app = express();
        app.on('start', start);
        app.on('error', error);
        app.use(kraken({
            basedir: basedir,
            onconfig(config, done) {
                done(null, config);
            }
        }));

        app.on('middleware:before:router', (eventargs) => {

            eventargs.app.get('/', function standard(req, res) {
                res.status(200).end();
            });

            eventargs.app.post('/', function multipart(req, res) {
                t.ok(~req.headers['content-type'].indexOf('multipart/form-data'));
                t.equal(typeof req.body, 'object');
                t.equal(typeof req.files, 'object');
                t.equal(typeof req.files.file, 'object');
                t.equal(req.files.file.name, 'lazerz.jpg');
                res.status(200).end();
            });

        });


    });

});
