import RGB from "@j5e/rgb";

(async function() {
	const rgb = await new RGB([13, 12, 14]);
	rgb.color("#993300");
	rgb.blink();

})();