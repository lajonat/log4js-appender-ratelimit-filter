# log4js-appender-ratelimit-filter
Rate limiting appender filter for log4js


## Configuration

```javascript
{
    "appenders": {
        "myAppender": {
            "type": "console"
        },
        "rateFilter": {
            "type": "log4js-appender-ratelimit-filter",
            "limits": {
                "TRACE": 5,
                "WARN": 10,
                "ERROR":10
            },
            "interval": 2000,
            "appender": "myAppender"
        }
    },
    "categories": {
        "default": {
            "appenders": [ "rateFilter" ],
            "level": "DEBUG"
        }
    }
}
```

This configuration will log up to 5 trace, debug or info messages every 2 second. Any log event in these levels after those 5 will be ignored.

The rate limiting is additive in levels - the above configuration will log 5 info messages, or 15 warning messages, or 25 error messages in each interval.
In addition, each error message will be counted towards the limit of all lower levels - if 10 errors messages were logged, no more debug messages will be logged in that interval.

The idea is to limit the amount of log messages being generated, but still let more important messages to be written even if they occur after the less important messages.