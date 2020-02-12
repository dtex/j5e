import Led from "@j5e/led";

(async function() {
	const led = await new Led({
		pin: 12,
		io: "builtin/pwm"
	});
	led.pulse();
})();