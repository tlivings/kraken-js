'use strict';

process.env.NODE_ENV='_krakendev';

var test = require('tape');
var path = require('path');
var util = require('util');
var express = require('express');
var request = require('supertest');
var kraken = require('../');


test('settings', (t) => {

    t.test('custom', (t) => {

        function start() {
            const foo = app.kraken.get('foo');
            const click = app.kraken.get('click');
            const custom = app.kraken.get('custom');
            t.equal(foo, 'baz');
            t.equal(click, 'clack');
            t.equal(custom, 'Hello, world!');
            t.deepEqual(app.kraken.get('nestedA:nestedB:seasonals'), [ 'spring', 'autumn', 'summer', 'winter' ]);
            t.end();
        }

        const options = {
            basedir: path.join(__dirname, 'fixtures', 'settings'),
            protocols: {
                custom(value) {
                    return util.format('Hello, %s!', value);
                }
            }
        };

        const app = express();
        app.on('start', start);
        app.on('error', t.error.bind(t));
        app.use(kraken(options));
    });


    t.test('should resolve from config (shortstop-resolve)', (t) => {
      const basedir = path.join(__dirname, 'fixtures', 'settings');

      function onconfig(config, cb) {
        const faviconPath = config.get('middleware:favicon:module:arguments')[0];
        t.equal(faviconPath, path.join(basedir, 'node_modules', 'favicon', 'icon.ico'));
        t.end();
      }

      const app = express();
      app.use(kraken({
        basedir,
        onconfig
      }));
    });


    t.test('should not clobber `trust proxy fn`', (t) => {
        // bug introduced by:
        // visionmedia/express@566720
        // expressjs/proxy-addr@7a7a7e

        function start() {
            request(app)
                .get('/ip')
                .expect(201, function done(err) {
                    t.error(err);
                    t.end();
                });
        }

        const options = {
            basedir: path.join(__dirname, 'fixtures', 'settings'),
            onconfig(settings, cb) {
                settings.set('express:trust proxy', false);
                cb(null, settings);
            }
        };

        const app = express();
        app.use(kraken(options));
        app.on('start', start);
        app.on('error', t.error.bind(t));

    });

});
