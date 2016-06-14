/*───────────────────────────────────────────────────────────────────────────*\
 │  Copyright 2016 PayPal                                                      │
 │                                                                             │
 │hh ,'""`.                                                                    │
 │  / _  _ \  Licensed under the Apache License, Version 2.0 (the "License");  │
 │  |(@)(@)|  you may not use this file except in compliance with the License. │
 │  )  __  (  You may obtain a copy of the License at                          │
 │ /,'))((`.\                                                                  │
 │(( ((  )) ))    http://www.apache.org/licenses/LICENSE-2.0                   │
 │ `\ `)(' /'                                                                  │
 │                                                                             │
 │   Unless required by applicable law or agreed to in writing, software       │
 │   distributed under the License is distributed on an "AS IS" BASIS,         │
 │   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  │
 │   See the License for the specific language governing permissions and       │
 │   limitations under the License.                                            │
 \*───────────────────────────────────────────────────────────────────────────*/
'use strict';

const domain = require('domain');
const thing = require('core-util-is');

const States = {
    CONNECTED: 0,
    DISCONNECTING: 2
};


function onceThunk() {
  let called = false;
  return function once(emitter, events, callback) {
    function call() {
      if (!called) {
        called = true;
        return callback.apply(this, arguments);
      }
    }
    events.forEach((event) => {
      emitter.once(event, call);
    });
  };
}

module.exports = function (config = {}) {
    let app = undefined;
    let server = undefined;

    function close() {
        state = States.DISCONNECTING;
        app.emit('shutdown', server, timeout);
    }

    const { template, timeout = 10 * 1000, uncaughtException, shutdownHeaders = {} } = config;

    let state = States.CONNECTED;

    const once = onceThunk();

    return function shutdown(req, res, next) {

        function json() {
            res.send({message: 'Server is shutting down.'});
        }

        function html() {
            template ? res.render(template) : json();
        }

        if (state === States.DISCONNECTING) {
            const headers = Object.assign({
                Connection: 'close'
            }, shutdownHeaders);

            res.header(headers);
            res.status(503);
            res.format({
                json: json,
                html: html
            });
            return;
        }

        if (!app) {
            // Lazy-bind - only attempt clean shutdown
            // if we've taken at least one request.
            app = req.app;
            server = req.socket.server;

            once(process, ['SIGTERM', 'SIGINT'], close);
        }

        const d = domain.create();

        d.add(req);
        d.add(res);

        d.run(() => {
            next();
        });

        d.once('error', (error) => {
            if (uncaughtException) {
                uncaughtException(error, req, res, next);
                return;
            }

            console.error(new Date().toUTCString(), 'UNCAUGHT', error.message);
            console.error(error.stack);

            next(error);

            close();
        });
    };

};
