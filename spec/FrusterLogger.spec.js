const conf = require("../conf.js");
const testUtils = require("fruster-test-utils");
const bus = require("fruster-bus");
const FrusterLogger = require("../FrusterLogger");

describe("FrusterLogger", () => {

	let log;

	beforeEach(() => {
		log = new FrusterLogger("silly", "Europe/Stockholm");
	})

	it("should log all levels", () => {
		log.error("This", "is", "error");
		log.warn("This", "is", "warn");
		log.remote("This", "is", "remote");
		log.audit("fake-user-id", "This is audit");
		log.info("This", "is", "info");
		log.debug("This", "is", "debug");
		log.silly("This", "is", "silly");
	});

	it("should info log a json object", () => {
		log.info("Info: A JSON object", {
			foo: 1,
			bar: {
				a: 1,
				b: 2
			}
		}, "yeah!");
	});

	it("should debug log a json object", () => {
		log.debug("Debug: A JSON object", {
			foo: 1,
			bar: {
				a: 1,
				b: 2
			}
		}, "yeah!");
	});

	it("should error log a json object", () => {
		log.error("Error: A JSON object", {
			foo: 1,
			bar: {
				a: 1,
				b: 2
			}
		}, "yeah!");
	});

	it("should error log in American timezone", () => {
		log = new FrusterLogger("silly", "America/Los_Angeles");
		log.error("What time is it, Trump?");
	});

	it("should audit log even though not connected to bus", () => {
		log.audit("userId", "message");
	});

	describe("audit and remote log when connected to bus", () => {

		testUtils.startBeforeEach({
			mockNats: true,
			bus: bus
		});

		it("should audit log and post to bus", (done) => {
			bus.subscribe(FrusterLogger.AUDIT_LOG_SUBJECT, (msg) => {
				expect(msg.data.message).toBe("message");
				expect(msg.data.userId).toBe("userId");
				expect(msg.data.payload).toBe("payload");
				done();
			});

			log.audit("userId", "message", "payload");
		});

		it("should remote log and post to bus", (done) => {
			bus.subscribe(FrusterLogger.REMOTE_LOG_SUBJECT, (msg) => {
				expect(msg.data.message).toEqual(["hello", "world"]);
				done();
			});

			log.remote("hello", "world");
		});
	});

});