const winston = require("winston");
const bus = require("fruster-bus");
const uuid = require("uuid");
const conf = require("./conf");
const moment = require("moment-timezone");


class FrusterLogger extends winston.Logger {

    constructor(logLevel = "info", timestampTimezone = "Europe/Stockholm") {
        super({
            exitOnError: false,
            level: logLevel,
            levels: {
                // Some really bad happened
                error: 0,

                // Something went wrong, but does not fail completely
                warn: 1,

                // Log to remote i.e. fruster-log-service if up an running
                remote: 2,

                // Audit log, will log to remote i.e. fruster-log-service if up and running
                audit: 3,

                // Info, not too verbose
                info: 4,

                // Debugging
                debug: 5,

                // Log everything!                
                silly: 7
            },
            colors: {
                error: "red",
                warn: "yellow",
                remote: "magenta",
                audit: "green",
                info: "cyan",
                debug: "gray",
                silly: "gray"
            }
        });
        this.logLevel = logLevel;
        this.timestampTimezone = timestampTimezone;
        this._configureConsoleLogging();
        this._attachRemoteLog();
        this._attachAuditLog();
    }

    /**
     * Attach log.remote().
     * 
     * Will intercept call to winstons log.remote() and post
     * log on bus if configure to do so.
     * 
     * Note that `remote()` cannot be defined as regular instance method
     * since Winston will overwrite it when winston.Logger is created.
     */
    _attachRemoteLog() {
        const superLog = this.remote;

        this.remote = (...args) => {
            superLog(...args);
            this._publishOnBus(FrusterLogger.REMOTE_LOG_SUBJECT, {
                level: "info", // translate remote -> info on receiving side
                message: args
            });
        };
    }

    /**
     * Attach log.audit().
     * 
     * Will intercept call to winstons log.audit() and post
     * log on bus if configure to do so.
     * 
     * Note that `audit()` cannot be defined as regular instance method
     * since Winston will overwrite it when winston.Logger is created.
     */
    _attachAuditLog() {
        const superLog = this.audit;

        this.audit = (userId, message, payload) => {
            superLog(`[${userId}] ${message}`);
            this._publishOnBus(FrusterLogger.AUDIT_LOG_SUBJECT, {
                userId, message, payload
            });
        };
    }

    _publishOnBus(subject, data) {
        // fruster-bus should expose better flag or function to check if connect
        // but this will do for now
        const isConnected = !!bus.request;

        if (isConnected) {
            bus.publish(subject, {
                reqId: uuid.v4(),
                data
            });
        }
    }

    /**
     * Enable logging to Papertrail using remote syslog.
     * 
     * @param {String} syslogHost 
     * @param {String} syslogPort 
     * @param {String} syslogName 
     * @param {String} syslogProgram 
     */
    enablePapertrailLogging(syslogHost, syslogPort, syslogName, syslogProgram) {
        require("winston-papertrail").Papertrail;

        let winstonPapertrail = new winston.transports.Papertrail({
            host: syslogHost,
            port: syslogPort,
            hostname: syslogName,
            program: syslogProgram
        });

        winstonPapertrail.on("error", function (err) {
            console.error(`Failed connecting to papertrail ${syslogHost}:${syslogPort}`, err);
        });

        super.add(winstonPapertrail, null, true);
    }

    _configureConsoleLogging() {
        const consoleTransport = new winston.transports.Console({
            humanReadableUnhandledException: true,
            handleExceptions: true,
            json: false,
            colorize: true,
            prettyPrint: true,
            timestamp: () => this._getTimestamp()
        });

        super.add(consoleTransport, null, true);
    }

    /**
     * Function that returns timestamp used for console log.
     * Note that timestamp is not used for remote syslog.
     */
    _getTimestamp()  {
        const timeZonedDate = moment(new Date()).tz(this.timestampTimezone);
        return `[${timeZonedDate.format("YYYY-MM-DD hh:mm:ss")}]`;
    }

}

FrusterLogger.AUDIT_LOG_SUBJECT = "log.audit";
FrusterLogger.REMOTE_LOG_SUBJECT = "log";

module.exports = FrusterLogger; 