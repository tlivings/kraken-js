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

const Bluebird = require('bluebird');
const path = require('path');
const confit = require('confit');
const handlers = require('shortstop-handlers');
const ssresolve = require('shortstop-resolve');

function createHandlers({ basedir, protocols = {} } = {}) {

    const result = Object.assign({
        file:    handlers.file(basedir),
        path:    handlers.path(basedir),
        base64:  handlers.base64(),
        env:     handlers.env(),
        require: handlers.require(basedir),
        exec:    handlers.exec(basedir),
        glob:    handlers.glob(basedir)
    }, protocols);

    return result;
}

function configPath(prefix) {
  return path.join(prefix, 'config');
}


exports.create = function create({ basedir, protocols } = {}) {

    const deferred = Bluebird.defer();
    const appProtocols = createHandlers({basedir, protocols});
    const baseProtocols = createHandlers({basedir, protocols});

    appProtocols.resolve = ssresolve(configPath(basedir));
    baseProtocols.resolve = ssresolve(configPath(path.dirname(__dirname)));

    const baseFactory = confit({ basedir: configPath(path.dirname(__dirname)), protocols: baseProtocols });

    baseFactory.create((err, baseConf) => {
        if (err) {
            deferred.reject(err);
            return;
        }

        const appFactory = confit({
            basedir: configPath(basedir),
            protocols: appProtocols
        });

        appFactory.create((err, appConf) => {
            if (err) {
                deferred.reject(err);
                return;
            }

            baseConf.merge(appConf);

            deferred.resolve(baseConf);
        });
    });

    return deferred.promise;
};
