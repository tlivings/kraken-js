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

const fs = require('fs');
const IncomingForm = require('formidable').IncomingForm;
const entries = require('entries');
const debug = require('util').debuglog('kraken/middleware/multipart');


/**
 * Filters requests for only those that are `multipart/form-data`
 * @param fn the handler to invoke
 * @returns {Function}
 */
function filter(fn) {
    return function multipart(req, res, next) {
        const  contentType = req.headers['content-type'];
        if (typeof contentType === 'string' && ~contentType.indexOf('multipart/form-data')) {
            debug('received multipart request');
            fn.apply(null, arguments);
            return;
        }
        next();
    };
}


/**
 * simple forEach that enumerates an object's properties
 * @param obj the object to enumerate
 * @param callback the callback to invoke, with the signature `callback(value, key, obj)`
 */
function forEachValue(obj, callback) {
    for (const [item, value] of entries(obj)) {
        callback(value, item, obj);
    }
}


/**
 * Cleanup handler factory
 * @param files the list of files to clean up
 * @returns {function(this:null)}
 */
function cleanify(files) {
    return forEachValue.bind(null, files, funlink);
}


/**
 * Removes the provided file from the filesystem
 * @param file a formidable File object
 */
function funlink(file) {
    const path = file.path;
    debug('removing', file.name);
    if (typeof path === 'string') {
        fs.unlink(path, (err) => {
            if (err) {
                debug('Failed to remove ' + path);
                debug(err);
            }
        });
    }
}


module.exports = function (config = {}) {

    return filter((req, res, next) => {
        const form = new IncomingForm(config);
        form.parse(req, (err, fields, files) => {
            if (err) {
                next(err);
                return;
            }

            req.body = fields;
            req.files = files;
            res.once('finish', cleanify(files));
            next();
        });
    });
};
