## j5e – Johnny Five for Embedded Systems
j5e is a device framework built for ECMA TC-53's IO pattern. Right now, that's only [Moddable's IO module for XS](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/io/io.md), but we should see more soon. 

*This project is very much in a "pre-alpha" form so use at your own risk.*

Example
````js
import Led from "@j5e/led";

(async function() {
	const led = await new Led(14);
	led.blink();
})();
````

Check out the [Getting Started](https://github.com/dtex/j5e/blob/master/examples/GETSTARTED.md) guide and the [API Documentation](https://dtex.github.io/j5e).
