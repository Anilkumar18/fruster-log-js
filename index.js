const winston = require('winston');
const conf = require('./conf');

var transports = [
  new winston.transports.Console({
    level: conf.logLevel,
    humanReadableUnhandledException: true,
    handleExceptions: true,
    json: false,
    colorize: true,
    prettyPrint: true
  })
];

if(conf.syslog) {
  require('winston-papertrail').Papertrail;
  
  var hostAndPort = conf.syslog.split(':');

  if(hostAndPort.length != 2) {
    console.error('ERROR: Invalid syslog host and port', conf.syslog);
  } else {
    console.log('Connecting to remote syslog', conf.syslog);

    var winstonPapertrail = new winston.transports.Papertrail({
      host: hostAndPort[0],
      port: hostAndPort[1],
      level: conf.logLevel,
      hostname: conf.syslogName,
      program: conf.syslogProgram
    });

    winstonPapertrail.on('error', function(err) {
      console.error('Failed connecting to papertrail', hostAndPort, err);
    });
    
    transports.push(winstonPapertrail);    
  }
}

module.exports = new winston.Logger({
  transports: transports,
  exitOnError: false
});
