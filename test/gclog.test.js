var expect = require('chai').expect;
var fs = require('fs');
var protobuf = require('protocol-buffers')
var GCLog = require('../lib/gclog');
describe('GCLog', function() {
  var config = {
    "email": process.env.EMAIL,
    "key": process.env.KEY,
    "version": process.env.VERSION,
    "projectsId": process.env.PROJECTS_ID,
    "resource_id": process.env.RESOURCE_ID,
    "resource_type": process.env.RESOURCE_TYPE,
    "logsId": process.env.LOGS_ID,
  }
  // describe('#constructor(config, payload)', function() {
  // 
  // });
  describe('#post(json)', function() {
    it('log to google cloud using raw json request.', function(done) {
      var logger = new GCLog(config);
      logger.on('logged', done);
      logger.post({
        "entries": [{
          "metadata": {
            "labels": {
              "compute.googleapis.com/resource_id": process.env.RESOURCE_ID,
              "compute.googleapis.com/resource_type": process.env.RESOURCE_TYPE
            },
            "timestamp": new Date(),
            "serviceName": "compute.googleapis.com",
            "severity": 'INFO'
          },
          "textPayload": "test for log to google cloud using raw json request."
        }]
      });
    });
  });
  describe('#log(level, log)', function() {
    it('should log to google cloud log.', function(done) {
      var logger = new GCLog(config);
      logger.on('logged', done);
      logger.log('INFO', 'test log from gclog.');
    });
  });
  describe('#log(level, log, format)', function() {
    it('should log structPayload to google cloud log.', function(done) {
      var logger = new GCLog(config);
      logger.on('logged', done);
      logger.log('INFO', {
        test: 'test',
        payload: 'test structPayload'
      }, 'structPayload');
    });
  });
  describe('#log(level, log)', function() {
    it('should log text to resource_type as app .', function(done) {
      var sample_config = {
        "email": process.env.EMAIL,
        "key": process.env.KEY,
        "version": process.env.VERSION,
        "projectsId": process.env.PROJECTS_ID,
        "resource_id": 'test-app',
        "resource_type": 'app',
        "logsId": process.env.LOGS_ID,
      }
      var logger = new GCLog(sample_config);
      logger.on('logged', done);
      logger.on('error', function(err){
        console.log(err);
        throw err;
      });
      logger.log('INFO', 'test custom resource_type.');
    });
  });
  // describe('#log(level, log, format)', function() {
  //   it('should log protoPayload to google cloud log.', function(done) {
  //     var messages = protobuf(fs.readFileSync('./test/test.proto'))
  //     var buf = messages.Test.encode({
  //       timestamp: Date.now(),
  //       payload: 'test protoPayload'
  //     })
  //     console.log(buf);
  //     var logger = new GCLog(config);
  //     logger.on('logged', done);
  //     logger.on('error', function(err){
  //       console.log(err);
  //       throw err;
  //     });
  //     logger.log('INFO', {
  //       '@type': 'type.googleapis.com/google.appengine.logging.v1.LogLine',
  //       logMessage: 'test protoPayload'
  //     }, 'protoPayload');
  //   });
  // });
});