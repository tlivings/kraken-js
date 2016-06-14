'use strict';

process.env.NODE_ENV='_krakendev';

const test = require('tape');
const path = require('path');
const express = require('express');
const request = require('supertest');
const kraken = require('../');

test('kraken', (t) => {

    t.test('startup without options', (t) => {
        t.plan(1);

        function start() {
            t.pass('server started');
        }

        function error(err) {
            t.error(err, 'server startup failed');
        }

        const app = express();
        app.on('start', start);
        app.on('error', error);
        app.use(kraken());
    });


    t.test('startup with basedir', (t) => {
        t.plan(1);

        function start() {
            t.pass('server started');
        }

        function error(err) {
            t.error(err, 'server startup failed');
        }

        const app = express();
        app.on('start', start);
        app.on('error', error);
        app.use(kraken(__dirname));
    });


    t.test('startup with options', (t) => {
        t.plan(1);

        function start() {
            t.pass('server started');
        }

        function error(err) {
            t.error(err, 'server startup failed');
        }

        const app = express();
        app.on('start', start);
        app.on('error', error);
        app.use(kraken({ basedir: __dirname }));
    });


    t.test('mount point', (t) => {
        t.plan(2);

        function start() {
            t.pass('server started');
            const server = request(app).get('/foo/').expect(200, 'ok', (err) => {
                t.error(err);
                t.end();
            });
        }

        function error(err) {
            t.error(err, 'server startup failed');
            t.end();
        }

        const options = {
            basedir: path.join(__dirname, 'fixtures', 'mount')
        };

        const app = express();
        app.on('start', start);
        app.on('error', error);
        app.use('/foo', kraken(options));
    });


    t.test('express route', (t) => {
        t.plan(2);

        function start() {
            t.pass('server started');
            const server = request(app).get('/foo/').expect(200, 'ok', (err) => {
                t.error(err);
                t.end();
            });
        }

        function error(err) {
            t.error(err, 'server startup failed');
            t.end();
        }

        const options = {
            basedir: path.join(__dirname, 'fixtures', 'mount'),
            onconfig(settings, cb) {
                settings.set('express:mountpath', '/foo');
                cb(null, settings);
            }
        };

        const app = express();
        app.on('start', start);
        app.on('error', error);
        app.use(kraken(options));
    });


    t.test('startup delay', (t) => {
        t.plan(1);

        function start() {
            t.pass('server started');
            t.end();
        }

        function error(err) {
            t.error(err, 'server startup failed');
            t.end();
        }

        const options = {
            onconfig(settings, cb) {
                setTimeout(cb.bind(null, null, settings), 1000);
            }
        };

        const app = express();
        app.on('start', start);
        app.on('error', error);
        app.use(kraken(options));
    });


    t.test('server 503 until started', (t) => {
        t.plan(3);

        let server = undefined;

        function start() {
            t.pass('server started');
            server = request(app).get('/').expect(404, (err) => {
                t.error(err, 'server is accepting requests');
                t.end();
            });
        }

        function error(err) {
            t.error(err, 'server startup failed');
            t.end();
        }

        const options = {
            onconfig(settings, cb) {
                setTimeout(cb.bind(null, null, settings), 1000);
            }
        };

        const app = express();
        app.on('start', start);
        app.on('error', error);
        app.use(kraken(options));

        server = request(app).get('/').expect(503, (err) => {
            t.error(err, 'server starting');
        });
    });

    t.test('server 503 until started with custom headers', (t) => {
        t.plan(3);

        let server = undefined;

        function start() {
            t.pass('server started');
            server = request(app).get('/').expect(404, (err) => {
                t.error(err, 'server is accepting requests');
                t.end();
            });
        }

        function error(err) {
            t.error(err, 'server startup failed');
            t.end();
        }

        const options = {
            onconfig(settings, cb) {
                setTimeout(cb.bind(null, null, settings), 1000);
            },
            startupHeaders: {
                "Custom-Header1": "Header1",
                "Custom-Header2": "Header2"
            }
        };

        const app = express();
        app.on('start', start);
        app.on('error', error);
        app.use(kraken(options));

        server = request(app).get('/')
            .expect('Custom-Header1', "Header1")
            .expect('Custom-Header2', "Header2")
            .expect(503, (err) => {
                t.error(err, 'server starting');
            });
    });


    t.test('startup error', (t) => {
        t.plan(3);

        function start() {
            t.fail('server started');
            t.end();
        }

        function error(err) {
            t.ok(err, 'server startup failed');
            request(app).get('/').expect(503, 'The application failed to start.', (err) => {
                t.error(err, 'server is accepting requests');
                t.end();
            });
        }

        const options = {
            onconfig(settings, cb) {
                setTimeout(cb.bind(null, new Error('fail')), 1000);
            }
        };

        const app = express();
        app.on('start', start);
        app.on('error', error);
        app.use(kraken(options));

        request(app).get('/').expect(503, 'Server is starting.', (err) => {
            t.error(err, 'server starting');
        });
    });


    t.test('shutdown', (t) => {
        const exit = process.exit;
        let expected = 0;

        process.exit = (code) => {
            t.equals(code, expected, 'correct exit code');
            expected += 1;

            if (expected === 2) {
                process.exit = exit;
                t.end();
            }
        };

        const app = express();
        app.use(kraken({ basedir: __dirname }));
        app.on('start', () => {
            app.emit('shutdown', server, 1000);
        });

        app.on('stop', () => {
            // Will fire twice because we never
            // really exit the process
            t.ok(1, 'server stopped');
        });

        // This listens on any random port the OS assigns.
        // since we don't actually connect to it for this test, we don't care which.
        //
        // See https://nodejs.org/api/net.html#net_server_listen_port_host_backlog_callback
        // for more information
        const server = app.listen(0);
        server.timeout = 0;
    });

    t.test('shutdown headers', (t) => {
        process.removeAllListeners('SIGTERM');

        const app = express();
        app.use(kraken({ basedir: __dirname }));

        app.on('start', () => {

            app.removeAllListeners('shutdown');

            app.once('shutdown', () => {
                request(app).get('/').end((error, response) => {
                    t.error(error);
                    t.equals(response.statusCode, 503, 'correct status code.');
                    t.ok(response.header['custom-header1'], 'has custom header 1.');
                    t.ok(response.headers['custom-header2'], 'has custom header 1.');
                    t.end();
                });
            });

            //need one request
            request(app).get('/').end((error, response) => {
                t.error(error);
                t.equals(response.statusCode, 404, 'correct status code.');

                process.emit('SIGTERM');
            });
        });
    });

    t.test('shutdown on uncaught', (t) => {
        process.removeAllListeners('SIGTERM');

        const app = express();
        app.use(kraken({ basedir: path.join(__dirname, 'fixtures', 'middleware') }));

        app.on('start', () => {

            app.removeAllListeners('shutdown');

            app.once('shutdown', () => {
                request(app).get('/').end((error, response) => {
                    t.error(error);
                    t.equals(response.statusCode, 503, 'correct status code.');
                    t.end();
                });
            });

            //need one request
            request(app).get('/uncaught').end((error, response) => {
                t.error(error);
                t.equals(response.statusCode, 500, 'correct status code.');
            });
        });
    });

    t.test('override shutdown on uncaught', (t) => {
        process.removeAllListeners('SIGTERM');

        const app = express();
        app.use(kraken({
            basedir: path.join(__dirname, 'fixtures', 'middleware'),
            onconfig(config, next) {
                config.set('middleware:shutdown:module:arguments', [
                    {
                        uncaughtException: function (error, req, res, next) {
                            next(error);

                            setImmediate(() => {
                                request(app).get('/').end((error, response) => {
                                    t.error(error);
                                    t.equals(response.statusCode, 404, 'correct status code.');
                                    t.end();
                                });
                            });
                        }
                    }
                ]);
                next(null, config);
            }
        }));

        app.on('start', () => {
            //need one request
            request(app).get('/uncaught').end((error, response) => {
                t.error(error);
                t.equals(response.statusCode, 500, 'correct status code.');
            });
        });
    });

    t.test('shutdown should only emit once, ever', (t) => {
        process.removeAllListeners('SIGINT');

        const app = express();
        app.use(kraken({ basedir: __dirname }));

        app.on('start', () => {
            app.removeAllListeners('shutdown');

            request(app).get('/').end((error, response) => {
                t.ok(!error, 'no error.');
                t.equals(response.statusCode, 404, 'correct status code.');
                app.once('shutdown', () => {
                    t.pass('shutdown emitted once.');
                    process.nextTick(() => {
                      app.once('shutdown', () => {
                        t.fail('shutdown emitted multiple times.');
                      });
                      process.emit('SIGINT');
                      process.nextTick(t.end.bind(t));
                    });
                });
                process.emit('SIGINT');
            });
        });
    });

});
