import Light from "j5e/light";
import LED from "j5e/led";

const light = await new Light(14);
const led = await new LED(12, {
  pwm: true
});

light.on("change", function(data) {
  led.brightness(1023 - data);
});
