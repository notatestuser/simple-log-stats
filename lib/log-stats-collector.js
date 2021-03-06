/* global module:true */
/* global require:true */

'use strict';

var mathlib = require('./math');

function LogStatsCollector(whitelist) {
    this.routeHits  = {};
    this.routeDynoHits = {};
    this.responseTimes = {};
    // object-ify whitelist for uber fast lookups
    if (Array.isArray(whitelist)) {
        this.whitelist = {};
        whitelist.forEach(function(route) {
            this.whitelist[route] = true;
        }, this);
    }
}

LogStatsCollector.prototype.recordRequest = function(route, dyno, latency) {
    if ( ! route) return;
    if (this.whitelist && ! this.whitelist[route]) return;

    // increment route call counter
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
    if ( ! this.routeHits[route]) {
        // no stats for an unknown route
        return {
            hits: 0,
            topDyno: 'n/a'
        };
    }
    var routeDynoHits = this.routeDynoHits[route];
    var largestDynoHits = 0;
    var largestDynoHitsDyno = null;
    Object.keys(routeDynoHits).forEach(function(dyno) {
        var hits = routeDynoHits[dyno];
        if (hits > largestDynoHits) {
            largestDynoHitsDyno = dyno;
            largestDynoHits = hits;
        }
    });
    var responseTimes = this.responseTimes[route];
    var stats = {
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
