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

const debug = require('util').debuglog('kraken/events');

module.exports = function events(app) {
    let timer = undefined;

    app.on('shutdown', function onshutdown(server, timeout) {

        const stop = function (code) {
            app.emit('stop');
            process.exit(code);
        };

        const ok = stop.bind(null, 0);
        const err = stop.bind(null, 1);

        debug('process shutting down');

        server.close(ok);

        clearTimeout(timer);

        timer = setTimeout(err, timeout);
    });

    return app;
};
