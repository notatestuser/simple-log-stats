/* global exports:true */
/* global require:true */

'use strict';

// a function that does nothing (used in testWriteLine)
var NOOP = function(){};

var LogLineParserStream = require('../lib/log-line-parser');

// mock LogStatsCollector
var lastRecordedStats = null;
var mockCollector = {
    recordRequest: function(route, dyno, latency) {
        lastRecordedStats = {
            route: route,
            dyno: dyno,
            latency: latency
        };
    }
};

// a sample line from the logs
var sampleLine = '2014-01-09T06:16:53.742892+00:00 heroku[router]: at=info method=GET path=/api/users/100002266342173/count_pending_messages host=services.pocketplaylab.com fwd="94.66.255.106" dyno=web.8 connect=9ms service=9ms status=304 bytes=0';

// the LogLineParserStream instance under test
var parser;

exports.setUp = function(done) {
    parser = new LogLineParserStream(mockCollector);
    done();
};

exports.testParseLine = function(test) {
    var parsed = parser.parseLine(sampleLine);
    test.deepEqual(parsed, {
        method: 'GET',
        route:  'GET /api/users/{user_id}/count_pending_messages',
        path:   '/api/users/100002266342173/count_pending_messages',
        dyno:   'web.8',
        times: {
            connect: 9,
            service: 9
        }
    });
    test.done();
};

exports.testWriteLine = function(test) {
    // emulate writing a line to the stream
    parser._write(sampleLine, null, NOOP);
    test.deepEqual(lastRecordedStats, {
        route:  'GET /api/users/{user_id}/count_pending_messages',
        dyno:   'web.8',
        latency: 18
    });
    test.done();
};
