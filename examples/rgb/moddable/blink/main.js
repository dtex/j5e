import Rgb from "@j5e/rgb";

(async function() {
	const led = await new Rgb([13, 12, 14]);
	led.blink();
})();