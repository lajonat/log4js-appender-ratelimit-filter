var log4js = require('log4js');
var assert = require('assert');

describe('test filter', function() {

	let recording = require('../node_modules/log4js/lib/appenders/recording.js');
	const setUpTest = function(config) {
		// set up the testing output.
		log4js.configure({
			appenders: {
				test: {
					type: 'recording'
				},
				rateFilter: {
					type: 'lib/filter',
					limits: config.limits,
					interval: config.interval,
					appender: config.appender
				}
			},
			categories: {
				default: {
					appenders: ['rateFilter'],
					level: 'ALL'
				}
			}
		});
	};

	afterEach(function() {
		recording.erase();
	});


	it ('should limit to 1 log', function() {
		setUpTest({
			limits: { TRACE: 1 },
			interval: 1000,
			appender: 'test'
		})

		var logger = log4js.getLogger("app");
		logger.info('hey');
		logger.info('hey');
		logger.info('hey');

		assert.equal(recording.replay().length,1, 'Did not limit calls');
	});

	it ('should limit to 1 error log', function(){
		setUpTest({
			limits: { TRACE: 1, ERROR: 1 },
			interval: 500,
			appender: 'test'
		})

		var logger = log4js.getLogger("app");
		logger.error('hey');
		logger.info('hey');
		logger.trace('hey');

		assert.equal(recording.replay().length,1, 'Did not limit calls');
		assert.equal(recording.replay()[0].level, log4js.levels.ERROR, 'Not correct error');
	});

	it ('should limit to 2 logs', function(){
		setUpTest({
			limits: { TRACE: 1, ERROR: 1 },
			interval: 500,
			appender: 'test'
		})

		var logger = log4js.getLogger("app");
		logger.info('hey');
		logger.error('hey');
		logger.trace('hey');

		assert.equal(recording.replay().length,2, 'Did not limit calls');
		assert.equal(recording.replay()[0].level, log4js.levels.INFO, 'Not correct error');
		assert.equal(recording.replay()[1].level, log4js.levels.ERROR, 'Not correct error');
	});

	it ('should limit to 2 logs, with time limit', function(done){
		setUpTest({
			limits: { TRACE: 1 },
			interval: 500,
			appender: 'test'
		})

		var logger = log4js.getLogger("app");
		logger.info('hey');
		logger.info('hey');
		logger.info('hey');

		assert.equal(recording.replay().length,1, 'Did not limit calls');
		setTimeout(function(){
			logger.info('hey');
			logger.info('hey');
			logger.info('hey');
			assert.equal(recording.replay().length,2, 'Did not limit calls');
			done();
		}, 800);
	});
});