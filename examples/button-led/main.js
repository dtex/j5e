import Button from "j5e/button";
import LED from "j5e/led";

const button = await new Button(14);
const led = await new LED(12);

button.on("open", function() {
  trace("off");
  led.stop().off();
});

button.on("close", function() {
  trace("on");
  led.on();
});

button.on("hold", function() {
  trace("hold");
  led.blink();
})