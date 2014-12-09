/* global exports:true */
/* global require:true */

'use strict';

var math = require('../lib/math');

exports.testMode = function(test) {
    var nums = [10, 30, 50, 50, 30, 50];
    var mode = math.mode(nums);
    test.equal(mode, 50);
    test.done();
};

exports.testMean = function(test) {
    var nums = [10, 30, 50, 50, 30, 40];
    var mean = math.mean(nums);
    test.equal(mean, 35);
    test.done();
};

exports.testMedian = function(test) {
    var nums = [10, 30, 50, 50, 30, 40];
    var median = math.median(nums);
    // 35 = (30 + 40) / 2
    test.equal(median, 35);
    test.done();
};
