// trace(Object.keys(device));
// import I2C from "embedded:io/i2c";

// let con = new I2C({
//   address: 0x73,
//   hz: 100000,
//   data: 21,
//   clock: 22
// });

import PCA9685 from "j5e/pca9685";
import LED from "j5e/led";

const pca9685 = await new PCA9685({
  pins: [21, 22],
  address: 0x40
});

pca9685.initialize();

let led = await new LED({
  io: pca9685,
  pin: 2
});

led.blink();
