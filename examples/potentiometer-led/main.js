import Sensor from "j5e/sensor";
import LED from "j5e/led";

const potentiometer = await new Sensor(14);
const led = await new LED(12, {
  pwm: true
});

potentiometer.on("change", function(data) {
  led.brightness(data/potentiometer.resolution);
});
