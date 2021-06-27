import assert from "assert";
import sinon from "sinon";
import { Analog, Digital, PWM } from "@dtex/mock-io";
import Motor from "j5e/motor";

describe("Motor - Non-Directional", function() {

  describe("Instantiation", function() {

    it("should return a valid non-directional Motor instance when passed a single pin", async function() {
      const motor = await new Motor({
        pwm: {
          pin: 12,
          io: PWM
        }
      });
      assert.strictEqual(motor instanceof Motor, true);
      assert.strictEqual(motor.io.pwm instanceof PWM, true);
      assert.strictEqual(motor.io.dir, null);
      assert.strictEqual(motor.io.cdir, null);
      assert.strictEqual(motor.LOW, 0);
      assert.strictEqual(motor.HIGH, 1023);
    });

    describe("Options", function() {

      describe("enabled", async function() {

        it("should not be enabled when enabled: false is passed to configuration", async function() {

          const motor = await new Motor({
            pwm: {
              pin: 12,
              io: PWM
            }
          });

          motor.configure({
            enabled: false
          });

          assert.strictEqual(motor.enabled, false);
        });

        it("should not move the motor when not enabled: false is passed to configuration", async function() {

          const motor = await new Motor({
            pwm: {
              pin: 12,
              io: PWM
            }
          });

          motor.configure({
            enabled: false
          });

          const writeSpy = sinon.spy(motor.io.pwm, "write");
          motor.speed(0.7);
          assert.strictEqual(writeSpy.callCount, 0);

        });

      });

      describe("threshold", async function() {

        it("should have the correct theshold when a custom threshold is passed", async function() {
          const motor = await new Motor({
            pwm: {
              pin: 12,
              io: PWM
            }
          });

          motor.configure({
            threshold: 0.5
          });

          const writeSpy = sinon.spy(motor.io.pwm, "write");
          motor.speed(0.4);
          assert.strictEqual(writeSpy.callCount, 1);
          assert.strictEqual(writeSpy.getCall(0).args[0], 0);

          motor.speed(0.6);
          assert.strictEqual(writeSpy.callCount, 2);
          assert.strictEqual(writeSpy.getCall(1).args[0], 613);

        });

      });

    });

  });

  describe("Properties", function() {

    describe("isOn", function() {

      it("should respond with true only when the motor is running", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        assert.strictEqual(motor.isOn, false);

        motor.forward();
        assert.strictEqual(motor.isOn, true);
      });

    });

    describe("currentSpeed", function() {

      it("should respond with the currentSpeed [0,1]", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        assert.strictEqual(motor.currentSpeed, 0);

        motor.forward();
        assert.strictEqual(motor.currentSpeed, 1);

        motor.speed(0.5);
        assert.strictEqual(motor.currentSpeed, 0.5);
      });

    });

    describe("enabled", function() {

      it("should respond with true when enabled", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        assert.strictEqual(motor.enabled, true);

        motor.disable();
        assert.strictEqual(motor.enabled, false);

        motor.enable();
        assert.strictEqual(motor.enabled, true);

      });

    });

  });

  describe("Methods", function() {

    describe("disable", function() {

      it("should disable the motor", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        const writeSpy = sinon.spy(motor.io.pwm, "write");
        motor.disable();
        motor.speed(0.7);
        assert.strictEqual(writeSpy.callCount, 0);

      });
    });

    describe("enable", function() {

      it("should enable the motor", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        const writeSpy = sinon.spy(motor.io.pwm, "write");

        motor.disable();
        motor.speed(0.7);
        assert.strictEqual(writeSpy.callCount, 0);

        motor.enable();
        motor.speed(0.7);
        assert.strictEqual(writeSpy.callCount, 1);

      });
    });

    describe("speed", function() {

      it("should set the motor to the requested speed", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        const writeSpy = sinon.spy(motor.io.pwm, "write");
        motor.speed(0.7);
        assert.strictEqual(writeSpy.callCount, 1);
        assert.strictEqual(writeSpy.getCall(0).args[0], 716);

      });
    });

    describe("start", function() {

      it("should start the motor at the current speed", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        const writeSpy = sinon.spy(motor.io.pwm, "write");
        motor.start(0.7);
        assert.strictEqual(writeSpy.callCount, 1);
        assert.strictEqual(writeSpy.getCall(0).args[0], 716);
      });

    });

    describe("stop", function() {

      it("should stop the motor", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        const writeSpy = sinon.spy(motor.io.pwm, "write");
        motor.start(0.7);
        assert.strictEqual(writeSpy.callCount, 1);
        assert.strictEqual(writeSpy.getCall(0).args[0], 716);
        motor.stop();
        assert.strictEqual(writeSpy.callCount, 2);
        assert.strictEqual(writeSpy.getCall(1).args[0], 0);
      });

    });

    describe("brake", function() {

      it("should set the PWM pin to LOW", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        const writeSpy = sinon.spy(motor.io.pwm, "write");

        motor.start(0.7);
        assert.strictEqual(writeSpy.callCount, 1);
        assert.strictEqual(writeSpy.getCall(0).args[0], 716);

        motor.brake();
        assert.strictEqual(writeSpy.callCount, 2);
        assert.strictEqual(writeSpy.getCall(1).args[0], 0);
      });

    });

    describe("resume", function() {

      it("should set pwm high", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        const writeSpy = sinon.spy(motor.io.pwm, "write");
        motor.forward();
        motor.stop();
        motor.resume();

        assert.strictEqual(writeSpy.callCount, 4);
        assert.strictEqual(writeSpy.getCall(0).args[0], 0);
        assert.strictEqual(writeSpy.getCall(1).args[0], 1023);
        assert.strictEqual(writeSpy.getCall(2).args[0], 0);
        assert.strictEqual(writeSpy.getCall(3).args[0], 1023);
      });

      // [ all other tests related to someMethod ]

    });

    describe("forward", function() {

      it("should set pwm high", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        const writeSpy = sinon.spy(motor.io.pwm, "write");

        motor.forward();
        assert.strictEqual(writeSpy.callCount, 2);
        assert.strictEqual(writeSpy.getCall(0).args[0], 0);
        assert.strictEqual(writeSpy.getCall(1).args[0], 1023);
      });

    });

    describe("fwd", function() {

      it("should set pwm high", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        const writeSpy = sinon.spy(motor.io.pwm, "write");

        motor.fwd();
        assert.strictEqual(writeSpy.callCount, 2);
        assert.strictEqual(writeSpy.getCall(0).args[0], 0 );
        assert.strictEqual(writeSpy.getCall(1).args[0], 1023);
      });

    });

    describe("reverse", function() {

      it("should throw", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        const writeSpy = sinon.spy(motor.io.pwm, "write");

        assert.throws(function() {
          motor.reverse();
        });
        assert.strictEqual(writeSpy.callCount, 0);
      });

    });

    describe("rev", function() {

      it("should throw", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        const writeSpy = sinon.spy(motor.io.pwm, "write");

        assert.throws(function() {
          motor.rev();
        });
        assert.strictEqual(writeSpy.callCount, 0);
      });

    });

  });

  describe("Events", async function() {

    describe("start", async function() {

      it("should emit start at the appropriate time", async function() {
        let clock = sinon.useFakeTimers();
        const startListener = sinon.stub();

        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        motor.on("start", function() {
          startListener();
        });
        assert.strictEqual(startListener.callCount, 0);

        motor.start(1);
        clock.tick(10);
        assert.strictEqual(startListener.callCount, 1);

        motor.speed(0.5);
        clock.tick(10);
        assert.strictEqual(startListener.callCount, 1);

        motor.stop();
        clock.tick(10);
        assert.strictEqual(startListener.callCount, 1);

        motor.start();
        clock.tick(10);
        assert.strictEqual(startListener.callCount, 2);

        motor.disable();
        clock.tick(10);
        assert.strictEqual(startListener.callCount, 2);

        motor.enable();
        clock.tick(10);
        assert.strictEqual(startListener.callCount, 2);

        clock.restore();
      });

    });

    describe("stop", function() {

      it("should emit stop at the appropriate time", async function() {
        let clock = sinon.useFakeTimers();
        const stopListener = sinon.stub();

        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        motor.on("stop", function() {
          stopListener();
        });
        assert.strictEqual(stopListener.callCount, 0);

        motor.start(1);
        clock.tick(10);
        assert.strictEqual(stopListener.callCount, 0);

        motor.speed(0.5);
        clock.tick(10);
        assert.strictEqual(stopListener.callCount, 0);

        motor.stop();
        clock.tick(10);
        assert.strictEqual(stopListener.callCount, 1);

        motor.start();
        clock.tick(10);
        assert.strictEqual(stopListener.callCount, 1);

        motor.disable();
        clock.tick(10);
        assert.strictEqual(stopListener.callCount, 1);

        motor.enable();
        clock.tick(10);
        assert.strictEqual(stopListener.callCount, 1);

        clock.restore();
      });

    });

    describe("brake", function() {

      it("should not emit brake if there is no brake ", async function() {
        let clock = sinon.useFakeTimers();
        const brakeListener = sinon.stub();

        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        motor.on("brake", function() {
          brakeListener();
        });
        assert.strictEqual(brakeListener.callCount, 0);

        motor.start(1);
        clock.tick(10);
        assert.strictEqual(brakeListener.callCount, 0);

        motor.speed(0.5);
        clock.tick(10);
        assert.strictEqual(brakeListener.callCount, 0);

        motor.stop();
        clock.tick(10);
        assert.strictEqual(brakeListener.callCount, 0);

        motor.start();
        clock.tick(10);
        assert.strictEqual(brakeListener.callCount, 0);

        motor.disable();
        clock.tick(10);
        assert.strictEqual(brakeListener.callCount, 0);

        motor.enable();
        clock.tick(10);
        assert.strictEqual(brakeListener.callCount, 0);

        motor.start();
        clock.tick(10);
        assert.strictEqual(brakeListener.callCount, 0);

        motor.brake();
        clock.tick(10);
        assert.strictEqual(brakeListener.callCount, 0);

        clock.restore();
      });

    });

    describe("release", function() {

      it("should not emit release if there is no brake ", async function() {
        let clock = sinon.useFakeTimers();
        const releaseListener = sinon.stub();

        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        motor.on("brake", function() {
          releaseListener();
        });
        assert.strictEqual(releaseListener.callCount, 0);

        motor.start(1);
        clock.tick(10);
        assert.strictEqual(releaseListener.callCount, 0);

        motor.speed(0.5);
        clock.tick(10);
        assert.strictEqual(releaseListener.callCount, 0);

        motor.stop();
        clock.tick(10);
        assert.strictEqual(releaseListener.callCount, 0);

        motor.start();
        clock.tick(10);
        assert.strictEqual(releaseListener.callCount, 0);

        motor.disable();
        clock.tick(10);
        assert.strictEqual(releaseListener.callCount, 0);

        motor.enable();
        clock.tick(10);
        assert.strictEqual(releaseListener.callCount, 0);

        motor.start();
        clock.tick(10);
        assert.strictEqual(releaseListener.callCount, 0);

        motor.brake();
        clock.tick(10);
        assert.strictEqual(releaseListener.callCount, 0);

        clock.restore();
      });

    });

  });

});


describe("Motor - Directional (two wire)", function() {

  describe("Instantiation", function() {

    it("should return a valid directional Motor instance when passed two pins", async function() {
      const motor = await new Motor({
        pwm: {
          pin: 12,
          io: PWM
        },
        dir: {
          pin: 13,
          io: Digital
        }
      });
      assert.strictEqual(motor instanceof Motor, true);
      assert.strictEqual(motor.io.pwm instanceof PWM, true);
      assert.strictEqual(motor.io.dir instanceof Digital, true);
      assert.strictEqual(motor.io.cdir, null);
      assert.strictEqual(motor.LOW, 0);
      assert.strictEqual(motor.HIGH, 1023);
    });

    describe("Options", function() {

      describe("invertPWM", async function() {

        it("should use sink drive when reversing", async function() {

          const motor = await new Motor({
            pwm: {
              pin: 12,
              io: PWM
            },
            dir: {
              pin: 13,
              io: Digital
            }
          });

          motor.configure({
            invertPWM: true
          });

          const speedSpy = sinon.spy(motor.io.pwm, "write");
          const directionSpy = sinon.spy(motor.io.dir, "write");

          motor.forward(0.7);
          assert.strictEqual(speedSpy.callCount, 2);
          assert.strictEqual(speedSpy.getCall(1).args[0], 716);
          assert.strictEqual(directionSpy.callCount, 1);
          assert.strictEqual(directionSpy.getCall(0).args[0], 0);

          motor.reverse(0.7);
          assert.strictEqual(speedSpy.callCount, 4);
          assert.strictEqual(speedSpy.getCall(3).args[0], 306);
          assert.strictEqual(directionSpy.callCount, 2);
          assert.strictEqual(directionSpy.getCall(1).args[0], 1);

        });

      });

    });

  });

  describe("Methods", function() {

    describe("forward", function() {

      it("should set pwm high and dir low", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          },
          dir: {
            pin: 13,
            io: Digital
          }
        });

        const speedSpy = sinon.spy(motor.io.pwm, "write");
        const directionSpy = sinon.spy(motor.io.dir, "write");

        motor.forward();
        assert.strictEqual(speedSpy.callCount, 2);
        assert.strictEqual(speedSpy.getCall(1).args[0], 1023);
        assert.strictEqual(directionSpy.callCount, 1);
        assert.strictEqual(directionSpy.getCall(0).args[0], 0);
      });

    });

    describe("fwd", function() {

      it("should set pwm high and dir low", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          },
          dir: {
            pin: 13,
            io: Digital
          }
        });

        const speedSpy = sinon.spy(motor.io.pwm, "write");
        const directionSpy = sinon.spy(motor.io.dir, "write");

        motor.fwd();
        assert.strictEqual(speedSpy.callCount, 2);
        assert.strictEqual(speedSpy.getCall(1).args[0], 1023);
        assert.strictEqual(directionSpy.callCount, 1);
        assert.strictEqual(directionSpy.getCall(0).args[0], 0);
      });

    });

    describe("reverse", function() {

      it("should set pwm high and dir high", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          },
          dir: {
            pin: 13,
            io: Digital
          }
        });

        const speedSpy = sinon.spy(motor.io.pwm, "write");
        const directionSpy = sinon.spy(motor.io.dir, "write");

        motor.reverse();
        assert.strictEqual(speedSpy.callCount, 2);
        assert.strictEqual(speedSpy.getCall(1).args[0], 1023);
        assert.strictEqual(directionSpy.callCount, 1);
        assert.strictEqual(directionSpy.getCall(0).args[0], 1);
      });

    });

    describe("rev", function() {

      it("should set pwm high and dir high", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          },
          dir: {
            pin: 13,
            io: Digital
          }
        });

        const speedSpy = sinon.spy(motor.io.pwm, "write");
        const directionSpy = sinon.spy(motor.io.dir, "write");

        motor.rev();
        assert.strictEqual(speedSpy.callCount, 2);
        assert.strictEqual(speedSpy.getCall(1).args[0], 1023);
        assert.strictEqual(directionSpy.callCount, 1);
        assert.strictEqual(directionSpy.getCall(0).args[0], 1);
      });

    });

  });

});

describe("Motor - Directional (three wire)", function() {

  describe("Instantiation", function() {

    it("should return a valid directional Motor instance when passed three pins", async function() {
      const motor = await new Motor({
        pwm: {
          pin: 12,
          io: PWM
        },
        dir: {
          pin: 13,
          io: Digital
        },
        cdir: {
          pin: 13,
          io: Digital
        }
      });
      assert.strictEqual(motor instanceof Motor, true);
      assert.strictEqual(motor.io.pwm instanceof PWM, true);
      assert.strictEqual(motor.io.dir instanceof Digital, true);
      assert.strictEqual(motor.io.cdir instanceof Digital, true);
      assert.strictEqual(motor.LOW, 0);
      assert.strictEqual(motor.HIGH, 1023);
    });

  });

  describe("Methods", function() {

    describe("forward", function() {

      it("should set pwm high, dir low, and cdir high", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          },
          dir: {
            pin: 13,
            io: Digital
          },
          cdir: {
            pin: 14,
            io: Digital
          }
        });

        const speedSpy = sinon.spy(motor.io.pwm, "write");
        const directionSpy = sinon.spy(motor.io.dir, "write");
        const cDirectionSpy = sinon.spy(motor.io.cdir, "write");

        motor.forward();
        assert.strictEqual(speedSpy.callCount, 2);
        assert.strictEqual(speedSpy.getCall(1).args[0], 1023);
        assert.strictEqual(directionSpy.callCount, 1);
        assert.strictEqual(directionSpy.getCall(0).args[0], 0);
        assert.strictEqual(cDirectionSpy.callCount, 1);
        assert.strictEqual(cDirectionSpy.getCall(0).args[0], 1);
      });

    });

    describe("fwd", function() {

      it("should set pwm high, dir low, and cdir high", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          },
          dir: {
            pin: 13,
            io: Digital
          },
          cdir: {
            pin: 14,
            io: Digital
          }
        });

        const speedSpy = sinon.spy(motor.io.pwm, "write");
        const directionSpy = sinon.spy(motor.io.dir, "write");
        const cDirectionSpy = sinon.spy(motor.io.cdir, "write");

        motor.fwd();
        assert.strictEqual(speedSpy.callCount, 2);
        assert.strictEqual(speedSpy.getCall(1).args[0], 1023);
        assert.strictEqual(directionSpy.callCount, 1);
        assert.strictEqual(directionSpy.getCall(0).args[0], 0);
        assert.strictEqual(cDirectionSpy.callCount, 1);
        assert.strictEqual(cDirectionSpy.getCall(0).args[0], 1);
      });

    });

    describe("reverse", function() {

      it("should set pwm high, dir high, and cdir low", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          },
          dir: {
            pin: 13,
            io: Digital
          },
          cdir: {
            pin: 14,
            io: Digital
          }
        });

        const speedSpy = sinon.spy(motor.io.pwm, "write");
        const directionSpy = sinon.spy(motor.io.dir, "write");
        const cDirectionSpy = sinon.spy(motor.io.cdir, "write");

        motor.reverse();
        assert.strictEqual(speedSpy.callCount, 2);
        assert.strictEqual(speedSpy.getCall(1).args[0], 1023);
        assert.strictEqual(directionSpy.callCount, 1);
        assert.strictEqual(directionSpy.getCall(0).args[0], 1);
        assert.strictEqual(cDirectionSpy.callCount, 1);
        assert.strictEqual(cDirectionSpy.getCall(0).args[0], 0);
      });

    });

    describe("rev", function() {

      it("should set pwm high, dir high, and cdir low", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          },
          dir: {
            pin: 13,
            io: Digital
          },
          cdir: {
            pin: 14,
            io: Digital
          }
        });

        const speedSpy = sinon.spy(motor.io.pwm, "write");
        const directionSpy = sinon.spy(motor.io.dir, "write");
        const cDirectionSpy = sinon.spy(motor.io.cdir, "write");

        motor.rev();
        assert.strictEqual(speedSpy.callCount, 2);
        assert.strictEqual(speedSpy.getCall(1).args[0], 1023);
        assert.strictEqual(directionSpy.callCount, 1);
        assert.strictEqual(directionSpy.getCall(0).args[0], 1);
        assert.strictEqual(cDirectionSpy.callCount, 1);
        assert.strictEqual(cDirectionSpy.getCall(0).args[0], 0);
      });

    });

  });

});