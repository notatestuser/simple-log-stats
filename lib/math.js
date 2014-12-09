/* global exports:true */

'use strict';

// these are not supposed to catch edge cases or anything :)

function sort(nums) {
    return nums.sort(function(num1, num2){
        return num1 - num2;
    });
}

exports.mean = function(nums) {
    var count = nums.length;
    var total = nums.reduce(function(_total, _num){
        return _total + _num;
    }, 0);
    return total / count;
};

exports.mode = function(nums) {
    var mode = -1;
    var modeOccurrences = 0;
    var thisOccurrences = 0;
    var lastNumber;
    sort(nums)
    .forEach(function(num) {
        if (lastNumber === num) {
            thisOccurrences++;
        } else {
            thisOccurrences = 1;
        }
        if (thisOccurrences > modeOccurrences) {
            mode = num;
            modeOccurrences = thisOccurrences;
        }
        lastNumber = num;
    });
    return mode;
};

exports.median = function(nums) {
    nums = sort(nums);
    var mid = Math.floor(nums.length / 2);
    if (nums.length % 2) {
        return nums[mid];
    } else {
        return (nums[mid-1] + nums[mid]) / 2.0;
    }
};
