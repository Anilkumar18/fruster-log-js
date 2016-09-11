const winston = require('winston');
const conf = require('./conf');
require('winston-papertrail').Papertrail;

var transports = [
  new winston.transports.Console({
    level: conf.logLevel,
    handleExceptions: true,
    json: false,
    colorize: true
  })
];

if(conf.syslog) {
  var hostAndPort = conf.syslog.split(':');

  if(hostAndPort.length != 2) {
    console.log('ERROR: Invalid syslog host and port', conf.syslog);
  } else {
    console.log('Connecting to remote syslog', conf.syslog);
    transports.push(new winston.transports.Papertrail({
      host: hostAndPort[0],
      port: hostAndPort[1],
      level: conf.logLevel,
      hostname: conf.syslogName,
      program: conf.syslogProgram
    }));    
  }
}

module.exports = new winston.Logger({
  transports: transports,
  exitOnError: false
});
