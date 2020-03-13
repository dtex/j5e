import LED from "@j5e/led";

(async function() {
	const led = await new LED(12);
	led.blink();
})();