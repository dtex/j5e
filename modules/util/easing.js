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

export function linear(n) { return n };
export function inQuad(n) { return n ** 2 };
export function outQuad(n) { return n * (2 - n) };
export function inOutQuad(n) { 
  n *= 2;
  return n < 1 ?
    HALF * n * n :
    -HALF * (--n * (n - 2) - 1);
};

export function inCube(n) { return n ** 3 };
export function outCube(n) { return --n * n * n + 1 };
export function inOutCube(n) {
  n *= 2;
  return n < 1 ?
    HALF * n ** 3 :
    HALF * ((n -= 2) * n * n + 2);
};

export function inQuart(n) { return n ** 4 };
export function outQuart(n) { return 1 - (--n * n ** 3) };
export function inOutQuart(n) {
  n *= 2;
  return n < 1 ?
    HALF * n ** 4 :
    -HALF * ((n -= 2) * n ** 3 - 2);
};

export function inQuint(n) { return n ** 5 };
export function outQuint(n) { return --n * n ** 4 + 1 };
export function inOutQuint(n) {
  n *= 2;
  return n < 1 ?
    HALF * n ** 5 :
    HALF * ((n -= 2) * n ** 4 + 2);
};

export function inSine(n) { return 1 - cos(n * PI / 2) };
export function outSine(n) { return sin(n * PI / 2) };
export function inOutSine(n) { return HALF * (1 - cos(PI * n)) };

export function inExpo(n) { return 0 === n ? 0 : 1024 ** (n - 1) };
export function outExpo(n) { return 1 === n ? n : 1 - 2 ** (-10 * n) };
export function inOutExpo(n) {
  if (n === 0) { return 0; }
  if (n === 1) { return 1; }
  return (n *= 2) < 1 ?
    HALF * (1024 ** (n - 1)) :
    HALF * (-(2 ** (-10 * (n - 1))) + 2);
};

export function inCirc(n) { return 1 - sqrt(1 - n * n) };
export function outCirc(n) { return sqrt(1 - (--n * n)) };
export function inOutCirc(n) {
  n *= 2;
  return (n < 1) ?
    -HALF * (sqrt(1 - n * n) - 1) :
    HALF * (sqrt(1 - (n -= 2) * n) + 1);
};

export function inBack(n) { return n * n * ((SI + 1) * n - SI) };
export function outBack(n) { return --n * n * ((SI + 1) * n + SI) + 1 };
export function inOutBack(n) {
  return (n *= 2) < 1 ?
    HALF * (n * n * ((SIO + 1) * n - SIO)) :
    HALF * ((n -= 2) * n * ((SIO + 1) * n + SIO) + 2);
};

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

export function inBounce(n) { return 1 - outBounce(1 - n); }
export function inOutBounce(n) {
  return n < HALF ?
    inBounce(n * 2) * HALF :
    outBounce(n * 2 - 1) * HALF + HALF;
};
