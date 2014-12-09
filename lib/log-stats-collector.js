/* global module:true */

'use strict';

var mathlib = require('./math');

function LogStatsCollector() {
    this.routeHits  = {};
    this.routeDynoHits = {};
    this.responseTimes = {};
}

LogStatsCollector.prototype.recordRequest = function(route, dyno, latency) {
    // increment route call counter
    if ( ! route) return;
    if ( ! this.routeHits[route]) {
        this.routeHits[route] = 0;
    }
    this.routeHits[route]++;

    // increment route-dyno call counter
    if ( ! dyno) return;
    if ( ! this.routeDynoHits[route]) {
        this.routeDynoHits[route] = {};
    }
    if ( ! this.routeDynoHits[route][dyno]) {
        this.routeDynoHits[route][dyno] = 0;
    }
    this.routeDynoHits[route][dyno]++;

    // record response time
    if ( ! latency) return;
    if ( ! this.responseTimes[route]) {
        this.responseTimes[route] = [];
    }
    this.responseTimes[route].push(latency);
};

LogStatsCollector.prototype.getKnownRoutes = function() {
    // sort by hits (descending)
    var routeHits = this.routeHits;
    return Object.keys(this.routeHits).sort(function(a, b) {
        return routeHits[b] - routeHits[a];
    });
};

LogStatsCollector.prototype.getStatsForRoute = function(route) {
    var stats;
    var responseTimes;
    var routeDynoHits;
    var largestDynoHits = 0;
    var largestDynoHitsDyno = null;
    if ( ! this.routeHits[route]) {
        // no stats for an unknown route
        return {
            hits: 0,
            topDyno: 'n/a'
        };
    }
    routeDynoHits = this.routeDynoHits[route];
    responseTimes = this.responseTimes[route];
    Object.keys(routeDynoHits).forEach(function(dyno) {
        var hits = routeDynoHits[dyno];
        if (hits > largestDynoHits) {
            largestDynoHitsDyno = dyno;
            largestDynoHits = hits;
        }
    });
    stats = {
        hits: this.routeHits[route],
        dynoHits: this.routeDynoHits[route],
        topDyno: largestDynoHitsDyno,
        responseTimes: {
            mean: mathlib.mean(responseTimes),
            mode: mathlib.mode(responseTimes),
            median: mathlib.median(responseTimes)
        }

    };
    return stats;
};

module.exports = LogStatsCollector;
