/**
 * fn module - Easing functions for animiation segments.
 * @module j5e/easing
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
 * @param {n} Input value
 * @returns {number}
 */
export function linear(n) { return n };

/** inQuad 
 * @param {n} Input value
 * @returns {number}
 */
export function inQuad(n) { return n ** 2 };

/** outQuad
 * @param {n} Input value
 * @returns {number}
 */
export function outQuad(n) { return n * (2 - n) };

/** inOutQuad
 * @param {n} Input value
 * @returns {number}
 */
export function inOutQuad(n) { 
  n *= 2;
  return n < 1 ?
    HALF * n * n :
    -HALF * (--n * (n - 2) - 1);
};

/** inCube
 * @param {n} Input value
 * @returns {number}
 */
export function inCube(n) { return n ** 3 };

/** outCube
 * @param {n} Input value
 * @returns {number}
 */
export function outCube(n) { return --n * n * n + 1 };

/** inOutCube
 * @param {n} Input value
 * @returns {number}
 */
export function inOutCube(n) {
  n *= 2;
  return n < 1 ?
    HALF * n ** 3 :
    HALF * ((n -= 2) * n * n + 2);
};

/** inQuart
 * @param {n} Input value
 * @returns {number}
 */
export function inQuart(n) { return n ** 4 };

/** outQuart
 * @param {n} Input value
 * @returns {number}
 */
export function outQuart(n) { return 1 - (--n * n ** 3) };

/** inOutQuart
 * @param {n} Input value
 * @returns {number}
 */
export function inOutQuart(n) {
  n *= 2;
  return n < 1 ?
    HALF * n ** 4 :
    -HALF * ((n -= 2) * n ** 3 - 2);
};

/** inQuint
 * @param {n} Input value
 * @returns {number}
 */
export function inQuint(n) { return n ** 5 };

/** outQuint
 * @param {n} Input value
 * @returns {number}
 */
export function outQuint(n) { return --n * n ** 4 + 1 };

/** inOutQuint
 * @param {n} Input value
 * @returns {number}
 */
export function inOutQuint(n) {
  n *= 2;
  return n < 1 ?
    HALF * n ** 5 :
    HALF * ((n -= 2) * n ** 4 + 2);
};

/** inSine
 * @param {n} Input value
 * @returns {number}
 */
export function inSine(n) { return 1 - cos(n * PI / 2) };

/** outSine
 * @param {n} Input value
 * @returns {number}
 */
export function outSine(n) { return sin(n * PI / 2) };

/** inOutSine
 * @param {n} Input value
 * @returns {number}
 */
export function inOutSine(n) { return HALF * (1 - cos(PI * n)) };

/** inExpo
 * @param {n} Input value
 * @returns {number}
 */
export function inExpo(n) { return 0 === n ? 0 : 1024 ** (n - 1) };

/** outExpo
 * @param {n} Input value
 * @returns {number}
 */
export function outExpo(n) { return 1 === n ? n : 1 - 2 ** (-10 * n) };

/** inOutExpo
 * @param {n} Input value
 * @returns {number}
 */
export function inOutExpo(n) {
  if (n === 0) { return 0; }
  if (n === 1) { return 1; }
  return (n *= 2) < 1 ?
    HALF * (1024 ** (n - 1)) :
    HALF * (-(2 ** (-10 * (n - 1))) + 2);
};

/** inCirc
 * @param {n} Input value
 * @returns {number}
 */
export function inCirc(n) { return 1 - sqrt(1 - n * n) };

/** outCirc
 * @param {n} Input value
 * @returns {number}
 */
export function outCirc(n) { return sqrt(1 - (--n * n)) };

/** inOutCirc
 * @param {n} Input value
 * @returns {number}
 */
export function inOutCirc(n) {
  n *= 2;
  return (n < 1) ?
    -HALF * (sqrt(1 - n * n) - 1) :
    HALF * (sqrt(1 - (n -= 2) * n) + 1);
};

/** inBack
 * @param {n} Input value
 * @returns {number}
 */
export function inBack(n) { return n * n * ((SI + 1) * n - SI) };

/** outBack
 * @param {n} Input value
 * @returns {number}
 */
export function outBack(n) { return --n * n * ((SI + 1) * n + SI) + 1 };

/** inOutBack
 * @param {n} Input value
 * @returns {number}
 */
export function inOutBack(n) {
  return (n *= 2) < 1 ?
    HALF * (n * n * ((SIO + 1) * n - SIO)) :
    HALF * ((n -= 2) * n * ((SIO + 1) * n + SIO) + 2);
};

/** outBounce
 * @param {n} Input value
 * @returns {number}
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

/** inBounce
 * @param {n} Input value
 * @returns {number}
 */
export function inBounce(n) { return 1 - outBounce(1 - n); }

/** inOutBounce
 * @param {n} Input value
 * @returns {number}
 */
export function inOutBounce(n) {
  return n < HALF ?
    inBounce(n * 2) * HALF :
    outBounce(n * 2 - 1) * HALF + HALF;
};
