var google = require('googleapis');
var request = require('request');
var debug = require('debug')('gclog');
var events = require('events');
var util = require('util');
/**
 * @param config              Google Cloud Config
 * @param config.email        Credential email
 * @param config.key          Credential key file
 * @param config.version      PI version of google cloud logging
 * @param config.projectsId   Part of `logName`. The name of the log resource into which to insert the log entries. (string)
 * @param config.logsId       Part of `logName`. See documentation of `projectsId`. (string)
 */
function gclog(config) {
  if (typeof config === undefined) throw new Error();
  this.config = config;
  this.url = 'https://logging.googleapis.com/' + this.config.version + '/projects/' + this.config.projectsId + '/logs/' + this.config.logsId + '/entries:write?alt=json';
  this.client = new google.auth.JWT(this.config.email, this.config.key, null, ['https://www.googleapis.com/auth/cloud-platform'], '');
  this.tokens = null;
  debug('config', this.config);
  debug('url', this.url);
}
util.inherits(gclog, events.EventEmitter);
gclog.prototype.default = function(log, format) {
  this.log('DEFAULT', log, format);
},
gclog.prototype.debug = function(log, format) {
  this.log('DEBUG', log, format);
},
gclog.prototype.info = function(log, format) {
  this.log('INFO', log, format);
},
gclog.prototype.notice = function(log, format) {
  this.log('NOTICE', log, format);
},
gclog.prototype.warning = function(log, format) {
  this.log('WARNING', log, format);
},
gclog.prototype.error = function(log, format) {
  this.log('ERROR', log, format);
},
gclog.prototype.critical = function(log, format) {
  this.log('CRITICAL', log, format);
},
gclog.prototype.alert = function(log, format) {
  this.log('ALERT', log, format);
},
gclog.prototype.emergency = function(log, format) {
  this.log('EMERGENCY', log, format);
},
/**
 * send raw json log object to google cloud
 * Please ref https://cloud.google.com/logging/docs/api/ref/rest/v1beta3/projects/logs/entries/write
 * @param json  json log object
 */
gclog.prototype.post = function(json) {
  var self = this;
  this.client.authorize(function(err, tokens) {
    if (err) {
      self.emit('error', err);
      return;
    }
    debug('oauth tokens', tokens);
    request.post({
      uri: self.url,
      method: 'POST',
      json: json,
      headers: {
        Authorization: 'Bearer ' + tokens.access_token
      }
    }, function(err, res, body) {
      if (err) {
        self.emit('error', err);
      } else {
        if (res.statusCode !== 200) {
          self.emit('error', body);
        } else {
          self.emit('logged');
        }
      }
    });
  });
};
/**
 * log
 * @param level   LogSeverity
 * @param log     log payload
 * @param format  optional log format. default "textPayload"
 */
gclog.prototype.log = function(level, log, format) {
  var self = this;
  var entry = {
    "metadata": {
      "labels": {
        "compute.googleapis.com/resource_id": self.config.resource_id,
        "compute.googleapis.com/resource_type": self.config.resource_type,
      },
      "timestamp": new Date(),
      "serviceName": "compute.googleapis.com",
      "severity": level
    }
  }
  entry[format || 'textPayload'] = log;
  debug('entry', entry);
  this.post({
    "entries": [entry]
  });
};
module.exports = gclog;