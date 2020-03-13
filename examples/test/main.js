import Digital from "builtin/digital";

const led = new Digital({
   pin: 12,
   mode: Digital.OutputOpenDrain,
});