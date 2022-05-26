import LED from "j5e/led";

(async() => {
  const led = await new LED(12, {
    pwm: true
  });
  led.pulse();
})();
