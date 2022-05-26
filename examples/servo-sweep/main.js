import Servo from "j5e/servo";

(async() => {
  const servo = await new Servo(12);
  servo.sweep();
})();
