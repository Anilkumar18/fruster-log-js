const winston = require("winston");
const bus = require("fruster-bus");
const uuid = require("uuid");

class FrusterLogger extends winston.Logger {

    /**
     * Creates an audit log entry. Will publish to bus if 
     * a connection exists.
     * 
     * The optional payload can be anything related to the log message.
     * 
     * @param {String} userId id of user this message is about
     * @param {String} msg log message
     * @param {any=} payload optional payload that will be persisted together with message 
     */
    audit(userId, msg, payload) {
        this.info(`[AUDIT ${userId}] ${msg}`);

        // fruster-bus should expose better flag or function to check if connect
        // but this will do for now
        const isConnected = !!bus.request;

        if (isConnected) {
            bus.publish("log-service.audit", {
                reqId: uuid.v4(),
                data: {
                    userId: userId,
                    message: msg,
                    payload: payload
                }
            });
        }
    }
    
}

module.exports = FrusterLogger; 