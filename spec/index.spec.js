const log = require("../index");
const conf = require("../conf.js");
const testUtils = require("fruster-test-utils");
const bus = require("fruster-bus");

describe("Fruster log", () => {

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

	it("should error log a json object in timezone", () => {
		conf.timestampTimezone = "America/Los_Angeles";
		log.error("Error: A JSON object", {
			foo: 1,
			bar: {
				a: 1,
				b: 2
			}
		}, "yeah!");
		conf.timestampTimezone = "Europe/Stockholm";
	});

	it("should audit log even though not connected to bus", () => {
		log.audit("userId", "message");
	});

	describe("audit log when connected to bus", () => {

		testUtils.startBeforeEach({
			mockNats: true,
			bus: bus
		});

		it("should audit log and post to bus", (done) => {
			bus.subscribe("log-service.audit", (msg) => {
				expect(msg.data.message).toBe("message");
				expect(msg.data.userId).toBe("userId");
				expect(msg.data.payload).toBe("payload");
				done();
			});
			
			log.audit("userId", "message", "payload");
		});
	});

});