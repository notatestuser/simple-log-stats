#!/usr/bin/env node

/* global process:true */
/* global console:true */
/* global require:true */

// @author Luke Plaster <me@lukep.org>

'use strict';

var fs = require('fs');
var byline = require('byline');
var AsciiTable = require('ascii-table');

// our libs!
var LogStatsCollector = require('./lib/log-stats-collector');
var LogLineParserStream = require('./lib/log-line-parser');

// -- ----- --

var fileName  = process.argv[2] || 'sample.log';
var whitelist = require('./' + (process.argv[3] || 'routes.json'));

// -- ----- --

// this will keep track of our stats
var statsCollector = new LogStatsCollector(whitelist);

// set up our streams (readStream = file input stream, lineParserStream = our parser)
var readStream = fs.createReadStream(fileName, { encoding: 'utf8' });
var lineParserStream = new LogLineParserStream(statsCollector);
byline(readStream).pipe(lineParserStream);

// -- ----- --

var table = new AsciiTable('Log statistics');
table.setHeading('Request', 'Hits', 'TopDyno', 'Mean', 'Median', 'Mode');

// when done let's build our table and print it to the console
readStream.on('end', function() {
    var displayRoutes = statsCollector.getKnownRoutes();
    // the whitelist might contain routes that had 0 hits (no stats). add 'em
    whitelist.forEach(function(route) {
        if (displayRoutes.indexOf(route) === -1) {
            displayRoutes.push(route);
        }
    });
    displayRoutes.forEach(function(route) {
        var routeStats = statsCollector.getStatsForRoute(route);
        var responseTimes = routeStats.responseTimes || {};
        table.addRow(
            route,
            routeStats.hits,
            routeStats.topDyno,
            responseTimes.mean   ? responseTimes.mean   + 'ms' : 'n/a',
            responseTimes.median ? responseTimes.median + 'ms' : 'n/a',
            responseTimes.mode   ? responseTimes.mode   + 'ms' : 'n/a'
        );
    });
    console.log(table.toString());
});
