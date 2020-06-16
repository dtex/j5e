import Sensor from "@j5e/sensor";

const sensor = await new Sensor(17);

sensor.on("change", function(data) {
  trace(`change: ${data}\n`);
});