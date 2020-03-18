Ideally robotics or IoT projects monitor and respond to changes in their environment, but sometimes we just want to follow a predetermined set of rules without regard to input. Think of the animatronic characters you've seen at theme park and sub par pizza restaurants. The Animation class allows you to do exactly that.

The class constructs objects that represent a single Animation. An Animation consists of a target and an array of segments. A target is the device or list of devices that are being animated. A segment is a short modular animation sequence (i.e. sit, stand, walk, wave, etc). An animation's segments are synchronous and run first-in, first-out.

Some things that can be animated:

* Servos
* LEDs
* RGB LEDs

Before you start creating animcations you should be familiar with the API of the device(s) you will be conrolling. You don't have to call the device methods directly but if you haven't used them before this would be a hard way to learn.

## Instantiate an Animation
Instantiating an Animation is simple. Invoke the constructor and pass in the instances of the devices you want to control in an array. For example:

````js
// Create an animation using three servos
import Servo from "@j5e/servo";
import Animation from "@j5e/animation";

(async function() {
  const coxa = new Servo(12);
  const femur = new Servo(13);
  const tibia = new Servo(14);

  const leg = new Animation([coxa, femur, tibia]);

  // Now we can animate the leg

})();
````

The devices you pass in are called the "Target" and you can think of them as the actors on your stage. There will be a practical limit on how many things you can actually control while still achieving reasonable performance, but that's dependent on your microcontroller and all the other things happening in your program.

## Enqueue a Segment
Now you need to make your Animation instance do something. You do these by enqueuing a segment or a series of segments. A segment is a short bit of an animation that represents a discreet, hopefully reusable sequence of actions. For example, you might have a walking robot with a Segment called "stand". This Segment would describe all the movements that need to be made by every joints in order for your robot to stand. Let's do that for the single leg we instantiated above. The stand Segment for that leg might look like this:

````js
const stand = {
  duration: 2000,
  cuePoints: [0, 0.5, 1.0],
  keyFrames: [ 
    [{degrees: 0}, {degrees: 135}, {degrees: 180}],
    [{degrees: 0}, {degrees: 90}, {degrees: 180}],
    [{degrees: 0}, {degrees: 45}, {degrees: 180}]
  ]
};
````
Note that a segment is just a JavaScript Object literal. It can be defined statically like we've done here or with some clever code that will define a unique segment based on some input parameters (cool huh?). Here's a breakdown of all the properties you can include on an animation segment:

* **target:** Overrides the target passed when the Animation was created
* **duration:** Duration of the segment in milliseconds (default 1000)
* **cuePoints:** Array of values from 0.0 to 1.0 representing the beginning and end of the animation respectively (default [0, 1])
* **keyFrames:** A 1 or 2 dimensional array of device positions over time. See more on keyFrames below. (required)
* **easing:** An easing function from ease-component to apply to the playback head on the timeline. See the ease-component docs for a list of available easing functions (default: "linear")
* **loop:** When true, segment will loop until animation.next() or animation.stop() is called (default: false)
* **loopback:** The cuePoint that the animation will loop back to. If the animation is playing in reverse, this is the point at which the animation will "loop back" to 1.0 (default: 0.0)
* **metronomic:** Will play to cuePoint[1] then play in reverse to cuePoint[0]. If the segment is set to loop then the animation will play back and forth until next(), pause() or stop() are called (default: false)
* **progress:** The starting point for the playback head (default 0.0)
* **currentSpeed:** Controls the speed of the playback head and scales the calculated duration of this and all subsequent segments until it is changed by another segment or a call to the speed() method (default: 1.0)
* **fps:** The maximum frames per second for the segment (default: 60)
* **onstart:** function to execute when segment is started (default: none)
* **onpause:** function to execute when segment is paused (default: none)
* **onstop:** function to execute when animation is stopped (default: none)
* **oncomplete:** function to execute when segment is completed (default: none)
* **onloop:** function to execute when segment loops (default: none)
