import LED from "@j5e/led";

(async function() {
	const led = await new LED({
		pin: 12,
		pwm: true
	});
	led.pulse();
})();