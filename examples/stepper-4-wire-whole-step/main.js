import Stepper from "j5e/stepper";

const stepper = await new Stepper([16, 5, 4, 0]);
stepper.step(100);
