/**
 * Easing functions for animation segments.
 * @module j5e/easing
 * @see {@link https://easings.net/en#|easings.net} to help understand easing functions
 *
 * @example
 * // Easing by keyFrame. Move a servo from 0° to 180° with inOutQuad easing and then back to 0° with outBounce easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inOutQuad, outBunce } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 8000,
 *     cuePoints: [0, 0.5, 1],
 *     keyFrames: [ 0, { value: 180, easing: inOutQuad }, {value: 0, easing: outBounce }]
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */

const SI = 1.70158;
const SIO = 1.70158 * 1.525;
const SB = 7.5625;
const HALF = 0.5;
const {
  PI,
  cos,
  sin,
  sqrt,
} = Math;

/** Linear
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @ignore
 */
export function linear(n) {
  return n;
};

/** inQuad
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInQuad|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inQuad easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inQuad } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inQuad
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inQuad(n) {
  return n ** 2;
};

/** outQuad
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeOutQuad|easings.net} for details
 * @example
 * // Ease an animation segment. Move a servo from 0° to 90° with linear easing and then 90° to 180° with outQuad easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { outQuad } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 0.5, 1],
 *     keyFrames: [0, 90, { value: 180, easing: outQuad }]
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function outQuad(n) {
  return n * (2 - n);
};

/** inOutQuad
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInOutQuad|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inOutQuad easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inOutQuad } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inOutQuad
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inOutQuad(n) {
  n *= 2;
  return n < 1 ?
    HALF * n * n :
    -HALF * (--n * (n - 2) - 1);
};

/** inCube
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInCubic|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inCube easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inCube } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inCube
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inCube(n) {
  return n ** 3;
};

/** outCube
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeOutCubic|easings.net} for details
 * @example
 * // Ease an animation segment. Move a servo from 0° to 90° with linear easing and then 90° to 180° with outCube easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { outCube } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 0.5, 1],
 *     keyFrames: [0, 90, { value: 180, easing: outCube }]
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function outCube(n) {
  return --n * n * n + 1;
};

/** inOutCube
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInOutCubic|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inOutCube easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inOutCube } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inOutCube
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inOutCube(n) {
  n *= 2;
  return n < 1 ?
    HALF * n ** 3 :
    HALF * ((n -= 2) * n * n + 2);
};

/** inQuart
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInQuart|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inQuart easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inQuart } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inQuart
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inQuart(n) {
  return n ** 4;
};

/** outQuart
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeOutQuart|easings.net} for details
 * @example
 * // Ease an animation segment. Move a servo from 0° to 90° with linear easing and then 90° to 180° with outQuart easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { outQuart } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 0.5, 1],
 *     keyFrames: [0, 90, { value: 180, easing: outQuart }]
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function outQuart(n) {
  return 1 - (--n * n ** 3);
};

/** inOutQuart
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInOutQuart|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inOutQuart easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inOutQuart } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inOutQuart
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inOutQuart(n) {
  n *= 2;
  return n < 1 ?
    HALF * n ** 4 :
    -HALF * ((n -= 2) * n ** 3 - 2);
};

/** inQuint
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInQuint|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inQuint easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inQuint } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inQuint
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inQuint(n) {
  return n ** 5;
};

/** outQuint
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeOutQuint|easings.net} for details
 * @example
 * // Ease an animation segment. Move a servo from 0° to 90° with linear easing and then 90° to 180° with outQuint easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { outQuint } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 0.5, 1],
 *     keyFrames: [0, 90, { value: 180, easing: outQuint }]
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function outQuint(n) {
  return --n * n ** 4 + 1;
};

/** inOutQuint
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInOutQuint|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inOutQuint easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inOutQuint } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inOutQuint
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inOutQuint(n) {
  n *= 2;
  return n < 1 ?
    HALF * n ** 5 :
    HALF * ((n -= 2) * n ** 4 + 2);
};

/** inSine
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInSine|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inSine easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inSine } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inSine
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inSine(n) {
  return 1 - cos(n * PI / 2);
};

/** outSine
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeOutSine|easings.net} for details
 * @example
 * // Ease an animation segment. Move a servo from 0° to 90° with linear easing and then 90° to 180° with outSine easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { outSine } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 0.5, 1],
 *     keyFrames: [0, 90, { value: 180, easing: outSine }]
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function outSine(n) {
  return sin(n * PI / 2);
};

/** inOutSine
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInOutSine|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inOutSine easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inOutSine } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inOutSine
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inOutSine(n) {
  return HALF * (1 - cos(PI * n));
};

/** inExpo
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInExpo|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inExpo easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inExpo } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inExpo
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inExpo(n) {
  return 0 === n ? 0 : 1024 ** (n - 1);
};

/** outExpo
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeOutExpo|easings.net} for details
 * @example
 * // Ease an animation segment. Move a servo from 0° to 90° with linear easing and then 90° to 180° with outExpo easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { outExpo } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 0.5, 1],
 *     keyFrames: [0, 90, { value: 180, easing: outExpo }]
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function outExpo(n) {
  return 1 === n ? n : 1 - 2 ** (-10 * n);
};

/** inOutExpo
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInOutExpo|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inOutExpo easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inOutExpo } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inOutExpo
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inOutExpo(n) {
  if (n === 0) {
    return 0;
  }
  if (n === 1) {
    return 1;
  }
  return (n *= 2) < 1 ?
    HALF * (1024 ** (n - 1)) :
    HALF * (-(2 ** (-10 * (n - 1))) + 2);
};

/** inCirc
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInCirc|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inCirc easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inCirc } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inCirc
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inCirc(n) {
  return 1 - sqrt(1 - n * n);
};

/** outCirc
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeOutCirc|easings.net} for details
 * @example
 * // Ease an animation segment. Move a servo from 0° to 90° with linear easing and then 90° to 180° with outCirc easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { outCirc } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 0.5, 1],
 *     keyFrames: [0, 90, { value: 180, easing: outCirc }]
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function outCirc(n) {
  return sqrt(1 - (--n * n));
};

/** inOutCirc
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInOutCirc|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inOutCirc easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inOutCirc } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inOutCirc
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inOutCirc(n) {
  n *= 2;
  return (n < 1) ?
    -HALF * (sqrt(1 - n * n) - 1) :
    HALF * (sqrt(1 - (n -= 2) * n) + 1);
};

/** inBack
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInBack|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inBack easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inBack } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inBack
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inBack(n) {
  return n * n * ((SI + 1) * n - SI);
};

/** outBack
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeOutBack|easings.net} for details
 * @example
 * // Ease an animation segment. Move a servo from 0° to 90° with linear easing and then 90° to 180° with outBack easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { outBack } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 0.5, 1],
 *     keyFrames: [0, 90, { value: 180, easing: outBack }]
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function outBack(n) {
  return --n * n * ((SI + 1) * n + SI) + 1;
};

/** inOutBack
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInOutBack|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inOutBack easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inOutBack } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inOutBack
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inOutBack(n) {
  return (n *= 2) < 1 ?
    HALF * (n * n * ((SIO + 1) * n - SIO)) :
    HALF * ((n -= 2) * n * ((SIO + 1) * n + SIO) + 2);
};

/** inBounce
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInBounce|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inBounce easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inBounce } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inBounce
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inBounce(n) {
  return 1 - outBounce(1 - n);
}

/** outBounce
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeOutBounce|easings.net} for details
 * @example
 * // Ease an animation segment. Move a servo from 0° to 90° with linear easing and then 90° to 180° with outBounce easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { outBounce } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 0.5, 1],
 *     keyFrames: [0, 90, { value: 180, easing: outBounce }]
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function outBounce(n) {
  if (n < (1 / 2.75)) {
    return SB * n * n;
  } else if (n < (2 / 2.75)) {
    return SB * (n -= (1.5 / 2.75)) * n + 0.75;
  } else if (n < (2.5 / 2.75)) {
    return SB * (n -= (2.25 / 2.75)) * n + 0.9375;
  } else {
    return SB * (n -= (2.625 / 2.75)) * n + 0.984375;
  }
};

/** inOutBounce
 * @param {Number} input value [0, 1]
 * @returns {Number}
 * @see {@link https://easings.net/en#easeInOutBounce|easings.net} for details
 * @example
 * // Ease the entire animation. Move a servo from 0° to 180° with inOutBounce easing.
 * import Servo from "j5e/servo";
 * import Animation from "j5e/animation";
 * import { inOutBounce } from "j5e/easing";
 *
 * (async() => {
 *   const servo = await new Servo(13);
 *   const ani = await new Animation(servo);
 *
 *   const wave = {
 *     duration: 4000,
 *     cuePoints: [0, 1],
 *     keyFrames: [0, 180],
 *     easing: inOutBounce
 *   };
 *
 *   ani.enqueue(wave);
 * })();
 */
export function inOutBounce(n) {
  return n < HALF ?
    inBounce(n * 2) * HALF :
    outBounce(n * 2 - 1) * HALF + HALF;
};
