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

if (conf.syslog) {
  require('winston-papertrail').Papertrail;

  var hostAndPort = conf.syslog.split(':');

  if (hostAndPort.length != 2) {
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

    winstonPapertrail.on('error', function (err) {
      console.error('Failed connecting to papertrail', hostAndPort, err);
    });

    transports.push(winstonPapertrail);
  }
}

module.exports = (function () {
  const w = new winston.Logger({
    transports: transports,
    exitOnError: false
  });

  if (conf.timestamps && !conf.syslog) {
    const getTimestamp = () => {
      return `[${new Date().toJSON()
        .replace("Z", "")
        .replace("T", " ")
        .substring(0, 19)}]`;
    };
    const logTypes = [
      { type: "debug", color: "\x1b[34m" },
      { type: "info", color: "\x1b[34m" },
      { type: "error", color: "\x1b[31m" }];
    const originalFunctions = {};

    logTypes.forEach(logTypeObj => {
      originalFunctions[logTypeObj.type] = w[logTypeObj.type];
      w[logTypeObj.type] = (...args) => {
        let timestampedArgs = [`${logTypeObj.color}${getTimestamp()}\x1b[0m`];
        args.forEach(a => timestampedArgs.push(a));
        originalFunctions[logTypeObj.type].apply(this, timestampedArgs);
      }
    });
  }

  return w;
}());

process.on("unhandledRejection", function (reason) {
  module.exports.error(reason);
});