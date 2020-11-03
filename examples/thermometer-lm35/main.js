import LM35 from "j5e/lm35";
import LED from "j5e/led";
import { timer } from "j5e/fn";

let last = 0;
let myTimer;

const thermometer = await new LM35({
  pin: 14
}, {
  threshold: 4
});

const led = await new LED(12, {
  pwm: true
});

thermometer.on("change", function(data) {
  
  trace(`${data.F}° Fahrenheit\n`);
  if (last > data.raw) {
    led.blink(100);
    last = data.raw;
  }
  
  if (last < data.raw) {
    led.stop().on();
    last = data.raw;
  }
  
  if (typeof myTimer !== "undefined" && myTimer !== null) timer.clearTimeout(myTimer);
  
  myTimer = timer.setTimeout(function() {
    myTimer = null;
    led.stop().off();
  }, 1000);

});