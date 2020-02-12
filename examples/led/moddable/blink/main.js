import Led from "@j5e/led";

(async function() {
	const led = await new Led(12);
	led.blink();
})();