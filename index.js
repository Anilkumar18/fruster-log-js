const winston = require("winston");
const moment = require("moment-timezone");
const conf = require("./conf");
const FrusterLogger = require("./FrusterLogger");

let transports = [
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

  const hostAndPort = conf.syslog.split(':');

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
  const w = new FrusterLogger({
    transports: transports,
    exitOnError: false
  });

  if (conf.timestamps && !conf.syslog) {
    const getTimestamp = () => {
      const timeZonedDate = moment(new Date()).tz(conf.timestampTimezone);
      return `[${timeZonedDate.format("YYYY-MM-DD hh:mm:ss")}]`;
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

process.on("unhandledRejection", (reason) => {
  module.exports.error(reason);
});
