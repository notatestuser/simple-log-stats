/* global module:true */
/* global require:true */

'use strict';

var util = require('util');
var stream = require('stream');

var PARSER_REGEXP = /method=([^\s]+).+path=([^\s]+).+dyno=([^\s]+).+connect=(\d+).+service=(\d+)/;

function LogLineParserStream(logStatsCollector) {
    // super()
    stream.Writable.call(this);

    this.logStatsCollector = logStatsCollector;
}

util.inherits(LogLineParserStream, stream.Writable);

LogLineParserStream.prototype.parseLine = function(line) {
    var matches = line.toString().match(PARSER_REGEXP);
    var parsedLine;
    var userIdMatcher;
    if ( ! matches) {
        return null;
    }
    // this is an object representation of our log entry
    parsedLine = {
        method: matches[1],
        path: matches[2],
        dyno: matches[3],
        times: {
            connect: parseInt(matches[4]),
            service: parseInt(matches[5])
        }
    };
    // for this exercise we will assume the userid is any numeric value in the URL
    // (this is a bad assumption to make in production!)
    userIdMatcher = parsedLine.path.match(/\/\d+/);
    if (userIdMatcher) {
        parsedLine.route = parsedLine.path
            .replace(userIdMatcher[0], '/{user_id}');
    } else {
        parsedLine.route = parsedLine.path;
    }
    // the route should be for e.g. GET /api/users/{user_id}
    parsedLine.route = parsedLine.method + ' ' + parsedLine.route;
    return parsedLine;
};

LogLineParserStream.prototype._write = function(line, enc, callback) {
    var parsed  = this.parseLine(line);
    var latency;
    if ( ! parsed) {
        return null;
    }
    latency = parsed.times.connect + parsed.times.service;
    if (this.logStatsCollector) {
        this.logStatsCollector.recordRequest(parsed.route, parsed.dyno, latency);
    }
    callback();
};

module.exports = LogLineParserStream;
