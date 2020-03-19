Ideally robotics or IoT projects monitor and respond to changes in their environment, but sometimes we just want to follow a predetermined set of rules without regard to input. Think of the animatronic characters you've seen at theme parks and sub-par pizza restaurants. The Animation class allows you to do exactly that.

The class constructs objects that represent a single Animation. An Animation consists of a target and a queue. A target is the device or list of devices that are being animated. A queue is an array of short, modular sequences (i.e. blink, fade, sit, stand, walk, etc). These sequences are called "segments" and are pushed onto the animation queue. Segments in the queue are synchronous and run first-in, first-out.

Things that can be animated:

* Servos
* LEDs
* RGB LEDs

Before you start creating animcations you should be familiar with the API of the device(s) you will be conrolling. You don't have to call the device methods directly but if you haven't used them before this will be a hard way to learn about them.

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
Now you need to make your Animation instance do something. You do this by enqueuing a segment or a series of segments. A segment is a short bit of an animation that represents a discreet, hopefully reusable sequence of actions. For example, you might have a walking robot with a Segment called "stand". This Segment would describe all the movements that need to be made by every joint in order for your robot to stand. Let's do that for the single leg we instantiated above. The stand Segment for that leg might look like this:

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
* **easing:** An easing function from ```@j5e/easing``` to apply to the playback head on the timeline. (default: "linear")
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

##keyFrame Arrays
If a single device is being animated, keyFrames may be a single dimensional array. If more than one device is being animated it must be 2-dimensional (an array of arrays). We call this a "keyFrame set". The index of each device in the target maps to the same index in a keyFrame set so the length of the two should be identical.

Each keyFrame array should have an element that maps to each cue point in the cuePoints array. keyFrames[0][0] for example represents the position of the first device in your animation target at the first cuePoint. These may or may not be the same length. If there are fewer elements in a keyFrame array than in the cuePoints array, then the keyFrame array will be right padded with null values.

Elements in a keyFrame array represent a device's position at the corresponding cuePoint. Positions can be described in a number of ways:

### A Number
This is a step in degrees from the previous cuePoint's position.
```
// servo.last.degrees === 90
... cuePoints: [0, 0.25, 0.5, 0.75, 1], keyFrames : [ -45, 90, -135, 20, 70 ], ...
```
![keyFrames as a number](img/Animation-Graph(1).png)

### null
The behavior of null varies depending upon its position in the array. If used in the first position, it will adopt the device's current value at the time the animation segment is played.
```
// servo.last.degrees === 90
... cuePoints: [0, 0.25, 0.5, 0.75, 1], keyFrames : [ null, 90, -135, 20, 70 ], ...
```
![null at beginning](img/Animation-Graph(2).png)
- - -
If used at the end of the array it will copy the previous known value.
```
// servo.last.degrees === 90
... cuePoints: [0, 0.25, 0.5, 0.75, 1], keyFrames : [ -45, 90, -135, 20, null ], ...
```
![null at end](img/Animation-Graph(3).png)
- - -
If used between two keyFrames this cuePoint will be ignored for this device and the value will be a tween of the previous and next known values.
```
// servo.last.degrees === 90
... cuePoints: [0, 0.25, 0.5, 0.75, 1], keyFrames : [ -45, 90, null, 20, -155 ], ...
```
![null in middle](img/Animation-Graph(4).png)

### false
Will copy the previous known value (don't move the device)
```
// servo.last.degrees === 90
... cuePoints: [0, 0.25, 0.5, 0.75, 1], keyFrames : [ -45, 90, false, 20, -155 ], ...
```
![false as a keyFrame](img/Animation-Graph(5).png)

### A keyFrame object
The available properties for keyFrame objects are:

**step**: A step in degrees from the previous cuePoint position.
```
// servo.last.degrees === 90
... cuePoints: [0, 0.25, 0.5, 0.75, 1], keyFrames : [ -45, {step: 90}, -135, 20, 70 ], ...
```
![step property](img/Animation-Graph(1).png)

**degrees**: The servo position in degrees.
```
// servo.last.degrees === 90
... cuePoints: [0, 0.25, 0.5, 0.75, 1], keyFrames : [ -45, {degrees: 180}, -135, 20, 70 ], ...
```
![degrees property](img/Animation-Graph(6).png)

**easing**: An easing function from ease-component to apply to the tweened value of the previous and next keyFrames. See the [ease-component docs](https://www.npmjs.org/package/ease-component) for a list of available easing functions (default: "linear")
```
// servo.last.degrees === 90
... cuePoints: [0, 0.25, 0.5, 0.75, 1], keyFrames : [ -45, {degrees: 180, easing: "inOutCirc", -135, 20, 70 ], ...
```
![easing property](img/Animation-Graph(7).png)

**copyDegrees**: An index from this keyFrames array from which we copy the calculated or explicitly set degrees value.
```
// servo.last.degrees === 90
... cuePoints: [0, 0.25, 0.5, 0.75, 1], keyFrames : [ -45, 90, -135, { copyDegrees: 1 }, -45 ], ...
```
![copyDegrees property](img/Animation-Graph(8).png)

**copyFrame**: An index from this keyFrames array from which we copy all of the properties.
```
// servo.last.degrees === 90
... cuePoints: [0, 0.25, 0.5, 0.75, 1], keyFrames : [ -45, 90, -135, { copyFrame: 1 }, 70 ], ...
```
![copyFrame property](img/Animation-Graph(9).png)

**position**: A two or three tuple defining a coordinate in 2d or 3d space.
```
// two-tuple
...  cuePoints: [0, 0.5, 1], keyFrames : [ { position: [10, 10 ] }, { position: [20, 50 ] }, { position: [10, 10 ] } ] ...

// three-tuple
...  cuePoints: [0, 0.5, 1], keyFrames : [ { position: [10, 10, 0 ] }, { position: [20, 50, 90 ] }, { position: [10, 10, 0 ] } ] ...
```

## Additional Tips

 * Use the servos' isInverted property to keep movements on the left and right side moving in the same direction when passed the same value.
 * Use the servos' offset property so that 90 degrees on one is the same as 90 degrees on corresponding servos.
 * Divide animations into small reusable components. These will be your segments.
 * Use onstop functions when your looping animation is halted to return a bot's animated limbs to their home positions. In other words, when an animation stops make sure your bot is ready for the next segment, whatever it may be.
 * Use loopback properties to give you a place for prep moves that occur before a looping segment. For example, when walking the first step is half the size of the looping steps.
 * Nearly always use null as the first value in an animation segment. It allows the segment to be started from a variety of positions.
 * For most walking bots a step cannot be accomplished by turning a single servo. Joints must work together to keep your end effector (foot) in a stable position on the floor. Turning a single servo will force effectors to work against each other and make your robot look clumsy.
 * Use an easing function on your segments. It gives your bot more natural movement.
 * Easing functions can be applied to the segment timeline AND keyframes. They are additive. Experiment with this.
 * Avoid having your end effector impact the ground with significant force. Doing so will eventually strip your servo gears.

["Key frames" on Wikipedia](https://en.wikipedia.org/wiki/Key_frame)