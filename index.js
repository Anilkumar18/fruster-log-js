const winston = require("winston");
const conf = require("./conf");
const FrusterLogger = require("./FrusterLogger");

module.exports = (function () {
  return new FrusterLogger(conf.logLevel, conf.timestampTimezone, conf.remoteLogLevel);
}());

process.on("unhandledRejection", (reason) => {
  module.exports.error(reason);
});