/* global exports:true */
/* global require:true */

'use strict';

var LogStatsCollector = require('../lib/log-stats-collector');

// the LogLineParser instance under test
var statsCollector;

exports.setUp = function(done) {
    statsCollector = new LogStatsCollector();
    done();
};

exports.testRecordRequestAndGetKnownRoutes = function(test) {
    statsCollector.recordRequest('/route/1', 'dyno.1', 10);
    statsCollector.recordRequest('/route/2', 'dyno.2', 20);
    statsCollector.recordRequest('/route/3', 'dyno.3', 30);
    var knownRoutes = statsCollector.getKnownRoutes();
    test.deepEqual(knownRoutes, [
        '/route/1',
        '/route/2',
        '/route/3'
    ]);
    test.done();
};

exports.testRecordRequestAndGetStatsForSingleRoute = function(test) {
    statsCollector.recordRequest('/route/1', 'dyno.1', 10);
    statsCollector.recordRequest('/route/1', 'dyno.2', 20);
    statsCollector.recordRequest('/route/1', 'dyno.1', 30);
    statsCollector.recordRequest('/route/1', 'dyno.1', 20);
    var stats = statsCollector.getStatsForRoute('/route/1');
    test.deepEqual(stats, {
        hits: 4,
        dynoHits: {
            'dyno.1': 3,
            'dyno.2': 1
        },
        topDyno: 'dyno.1',
        responseTimes: {
            mean: 20,
            mode: 20,
            median: 20
        }
    });
    test.done();
};
