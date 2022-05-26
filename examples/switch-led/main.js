import Switch from "j5e/switch";
import LED from "j5e/led";

(async() => {
  const mySwitch = await new Switch(14);
  const led = await new LED(12);

  mySwitch.on("open", function() {
    trace("off");
    led.off();
  });

  mySwitch.on("close", function() {
    trace("on");
    led.on();
  });
})();
