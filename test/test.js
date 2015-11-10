var log4js = require('log4js');
var assert = require("assert");

describe('test filter', function(){

	it ('should limit to 1 log', function(){
		var logEvents = [];
		log4js.clearAppenders();
		var appender = require('../lib/filter')
	        .appender({TRACE:1},
	          1000,
	          function(evt) { logEvents.push(evt); }
	        );
	      log4js.addAppender(appender, ["app"]);	

	  	var logger = log4js.getLogger("app");    
	  	logger.info('hey');
	  	logger.info('hey');
	  	logger.info('hey');

	  	assert.equal(logEvents.length,1, 'Did not limit calls');
	});

	it ('should limit to 1 error log', function(){
		var logEvents = [];
		log4js.clearAppenders();
		var appender = require('../lib/filter')
	        .appender({
	        	TRACE:1,
	        	ERROR:1
	        },
	          500,
	          function(evt) { logEvents.push(evt); }
	        );
	      log4js.addAppender(appender, ["app"]);	

	  	var logger = log4js.getLogger("app");    
	  	logger.error('hey');
	  	logger.info('hey');
	  	logger.trace('hey');
	  	
	  	assert.equal(logEvents.length,1, 'Did not limit calls');
	  	assert.equal(logEvents[0].level.level, log4js.levels.ERROR.level, 'Not correct error');
	});

	it ('should limit to 2 logs', function(){
		var logEvents = [];
		log4js.clearAppenders();
		var appender = require('../lib/filter')
	        .appender({
	        	TRACE:1,
	        	ERROR:1
	        },
	          500,
	          function(evt) { logEvents.push(evt); }
	        );
	      log4js.addAppender(appender, ["app"]);	

	  	var logger = log4js.getLogger("app");    
	  	logger.info('hey');
	  	logger.error('hey');
	  	logger.trace('hey');
	  	
	  	assert.equal(logEvents.length,2, 'Did not limit calls');
	   assert.equal(logEvents[0].level.level, log4js.levels.INFO.level, 'Not correct error');
	   assert.equal(logEvents[1].level.level, log4js.levels.ERROR.level, 'Not correct error');	
	});

	it ('should limit to 2 logs, with time limit', function(done){
		var logEvents = [];
		log4js.clearAppenders();
		var appender = require('../lib/filter')
	        .appender({TRACE:1},
	          500,
	          function(evt) { logEvents.push(evt); }
	        );
	      log4js.addAppender(appender, ["app"]);	

	  	var logger = log4js.getLogger("app");    
	  	logger.info('hey');
	  	logger.info('hey');
	  	logger.info('hey');

		assert.equal(logEvents.length,1, 'Did not limit calls');
	  	setTimeout(function(){
			logger.info('hey');
		  	logger.info('hey');
		  	logger.info('hey');	  		
		  	assert.equal(logEvents.length,2, 'Did not limit calls');
		  	done();
	  	}, 800);
	});
});