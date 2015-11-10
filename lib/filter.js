'use strict';

var log4js = require('log4js');

var levelMap = {};

// Check whether the given level limit was reached - returns whether to log (true = not reached limit).
// Also increases the current number of log for the given level
function checkLimit(limit) {
    if ((limit.limit < 0) || (limit.current < limit.limit)) {
        limit.current++;
        return true;
    }
    return false;
}

// These functions correspond to the names of the levels, to enable this code: checks["INFO"]()
// Each function checks the limit of its level, and increases its current number, as well as for all the lower levels.
// This way, each debug message raises the number of the debug limit, but each error message raises the limit for error, warn, info, debug, trace.
var checks = {};
checks.TRACE = function () {
    var limit = levelMap[log4js.levels.TRACE.level];
    return checkLimit(limit);
};
checks.DEBUG = function () {
    var limit = levelMap[log4js.levels.DEBUG.level];
    checks.TRACE();
    return checkLimit(limit);
};
checks.INFO = function () {
    var limit = levelMap[log4js.levels.INFO.level];
    checks.DEBUG();
    return checkLimit(limit);
};
checks.WARN = function () {
    var limit = levelMap[log4js.levels.WARN.level];
    checks.INFO();
    return checkLimit(limit);
};
checks.ERROR = function () {
    var limit = levelMap[log4js.levels.ERROR.level];
    checks.WARN();
    return checkLimit(limit);
};
checks.FATAL = function () {
    var limit = levelMap[log4js.levels.FATAL.level];
    checks.ERROR();
    return checkLimit(limit);
};
checks.MARK = function () {
    var limit = levelMap[log4js.levels.MARK.level];
    checks.FATAL();
    return checkLimit(limit);
};

// Initialize log level limits
['Trace', 'Debug', 'Info', 'Warn', 'Error', 'Fatal', 'Mark'].forEach(
    function (levelString) {
        var level = log4js.levels.toLevel(levelString);
        levelMap[level.level] = { limit: -1, current: 0 };
    }
);

// Create filter appender
function rateFilter(limits, interval, appender) {
    if (limits) {
        // Read limits from config - each level can define its own limit, but this is accumalated:
        // If debug is 10 and error is 10, the limits are 10,10,10,20,20.
        // This is so that the rate limiting will be shared on all messages, but more important messages can get precedence
        var accumulatedLimit = 0;
        if (limits.TRACE) {
            accumulatedLimit += limits.TRACE;
        }
        levelMap[log4js.levels.TRACE.level].limit = accumulatedLimit;
        if (limits.DEBUG) {
            accumulatedLimit += limits.DEBUG;
        }
        levelMap[log4js.levels.DEBUG.level].limit = accumulatedLimit;
        if (limits.INFO) {
            accumulatedLimit += limits.INFO;
        }
        levelMap[log4js.levels.INFO.level].limit = accumulatedLimit;
        if (limits.WARN) {
            accumulatedLimit += limits.WARN;
        }
        levelMap[log4js.levels.WARN.level].limit = accumulatedLimit;
        if (limits.ERROR) {
            accumulatedLimit += limits.ERROR;
        }
        levelMap[log4js.levels.ERROR.level].limit = accumulatedLimit;
        if (limits.FATAL) {
            accumulatedLimit += limits.FATAL;
        }
        levelMap[log4js.levels.FATAL.level].limit = accumulatedLimit;
        if (limits.MARK) {
            accumulatedLimit += limits.MARK;
        }
        levelMap[log4js.levels.MARK.level].limit = accumulatedLimit;
    }

    // Define the reset event - every second the limits are reset.
    // The interval is unreffed so that it won't keep the program running by itself
    var resetInterval = 1000;
    if ((interval) && (interval > 0)){
        resetInterval = interval;
    }

    var resetLimit = setInterval(function () {
        levelMap[log4js.levels.TRACE.level].current = 0;
        levelMap[log4js.levels.DEBUG.level].current = 0;
        levelMap[log4js.levels.INFO.level].current = 0;
        levelMap[log4js.levels.WARN.level].current = 0;
        levelMap[log4js.levels.ERROR.level].current = 0;
        levelMap[log4js.levels.FATAL.level].current = 0;
        levelMap[log4js.levels.MARK.level].current = 0;
    }, resetInterval);
    resetLimit.unref();
    
    // This actually handles the log events - if the event's log level is not limited, forward to the appender for writing
    return function (logEvent) {
        if (checks[logEvent.level.levelStr]()) {
            appender(logEvent);
        }
    };
}

function configure(config) {
    log4js.loadAppender(config.appender.type);
    var appender = log4js.appenderMakers[config.appender.type](config.appender);
    return rateFilter(config.limits, config.interval, appender);
}

exports.appender = rateFilter;
exports.configure = configure;