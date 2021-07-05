/**
 * For working with GPS receivers
 * @module j5e/gps
 * @requires module:j5e/event
 * @requires module:j5e/fn
 */

import { Emitter } from "j5e/event";
import { normalizeIO, getProvider, toFixed } from "j5e/fn";

/**
 * Class representing a GPS receiver
 * @classdesc The GPS class allows communication with any GPS receiver that will send NMEA sentences over serial as soon as it is powered on
 * @extends Emitter
 * @fires GPS#sentence
 * @fires GPS#operations
 * @fires GPS#acknowledge
 * @fires GPS#unkown
 * @fires GPS#data
 * @fires GPS#change
 * @fires GPS#navigation
 */
class GPS extends Emitter {

  #state = {
    input: "",
    frequency: 1,
    fixed: 6,
    sat: {},
    latitude: 0.0,
    longitude: 0.0,
    altitude: 0.0,
    speed: 0.0,
    course: 0.0,
    time: null,
    lowPowerMode: false
  };

  /**
   * Instantiate a GPS Receiver
   * @param {(number[]|string[]|object)} io - The pin numbers, pin identifiers or a complete IO options object
   * @param {number} [io.baud=9600] - The baud rate for serial communication
   * @param {(number[]|string[])} [io.pins] - If passing an object, the pin numbers or pin identifiers for transmit and receive in a 2 element array
   * @param {(number|string)} [io.transmit] - The pin number or pin identifier for transmit
   * @param {(number|string)} [io.receive] - The pin number or pin identifier for receive
   * @param {(number|string)} [io.port=0] - The serial port number or port identifier
   */

  constructor(io) {
    return (async() => {

      io = normalizeIO(io);

      if (Array.isArray(io.pins)) {
        io.transmit = io.pins[0];
        io.receive = io.pins[1];
      }

      super();

      const Provider = await getProvider(io, "Serial");

      this.io = new Provider({
        baud: io.baud || 9600,
        transmit: io.transmit,
        receive: io.receive,
        port: io.port || 0,
        format: "buffer",
        onReadable: (count) => {
          this.processData(count);
        }
      });

      return this;
    })();
  }

  /**
   * Configure a GPS
   * @returns {GPS} The instance on which the method was called
   * @param {object} [options={}] - An object containing device options
   * @param {number} [options.frequency=1] - The frequency of updates in Hz
   * @param {number} [options.fixed=6] - Precision for latitude and longitude readings
   * @example
   * import GPS from "j5e/gps";
   *
   * const gps = await new GPS({
   *   transmit: 17,
   *   receive: 16,
   *   port: 2,
   *   baud: 9600
   * });
	 *
   * gps.configure({
   *   frequency: 2
   * });
   */
  config(options) {
    if (options.frequency) {
      this.frequency = options.frequency;
      this.#state.frequency = options.frequency;
    }
    if (options.fixed) {
      this.#state.fixed = options.fixed;
    }
  }

  /**
   * The most recent measured latitude
   * @type {number}
   * @readonly
   */
  get latitude() {
    return this.#state.latitude;
  }

  /**
   * The most recent measured longitude
   * @type {number}
   * @readonly
   */
  get longitude() {
    return this.#state.longitude;
  }

  /**
   * The most recent measured altitude
   * @type {number}
   * @readonly
   */
  get altitude() {
    return this.#state.altitude;
  }

  /**
   * Satellite operation details {pdop, hdop, vdop}
   * @type {object}
   * @readonly
   */
  get sat() {
    return this.#state.sat;
  }

  /**
   * The most recent measured ground speed
   * @type {number}
   * @readonly
   */
  get speed() {
    return this.#state.speed;
  }

  /**
   * The most recent measured course
   * @type {number}
   * @readonly
   */
  get course() {
    return this.#state.course;
  }

  /**
   * Time of last fix
   * @type {number}
   * @readonly
   */
  get time() {
    return this.#state.time;
  }

  /**
   * Frequency of updates in hz
   * @type {number}
   */
  get frequency() {
    return this.#state.frequency;
  }

  set frequency(frequency) {
    throw "Frequency setter not defined";
  }

  /*
   * Internal method used to process incoming serial data
   * @private
   * @param {number} count - Length of data available for serial read
   */
  processData(count) {
    let x = this.io.read(count);

    this.#state.input += String.fromCharCode.apply(null, new Uint8Array(x));

    let sentences = this.#state.input.split("\r\n");
    if (sentences.length > 1) {
      for (let i = 0; i < sentences.length - 1; i++) {
        this.parseNmeaSentence(sentences[i]);
      }
      this.#state.input = sentences[sentences.length - 1];
    }
  }

  /*
   * Send a command to the GPS receiver module
   * @param {string} command - The command (minus the checksum) to send
   * @returns null
   */
  sendCommand = function(command) {
    // Append *, checksum and cr/lf
    command += getNmeaChecksum(command.substring(1));
    let commandAB = str2ab(command);
    this.io.write(commandAB);
  };

  /*
   * Internal method used parsing NMEA data
   * @param {string} sentence - The NMEA sentence to be parsed
   * @private
   * @see {@link http://aprs.gids.nl/nmea|NMEA Sentence Information}
   */
  parseNmeaSentence(sentence) {
    const cksum = sentence.split("*");

    // Check for valid sentence
    if (cksum[1] !== getNmeaChecksum(cksum[0].substring(1))) {
      return;
    }

    this.emit("sentence", sentence);

    const segments = cksum[0].split(",");
    const last = {
      latitude: this.#state.latitude,
      longitude: this.#state.longitude,
      altitude: this.#state.altitude,
      speed: this.#state.speed,
      course: this.#state.course
    };

    let now = new Date();

    switch (segments[0]) {
      case "$GPGGA":
        // Time, position and fix related data
        this.#state.time = new Date(now.getUTCFullYear(), now.getMonth(), now.getDay(), Number(segments[1].substring(0, 2)), Number(segments[1].substring(2, 4)), Number(segments[1].substring(4, 6)));
        this.#state.latitude = degToDec(segments[2], 2, segments[3], this.#state.fixed);
        this.#state.longitude = degToDec(segments[4], 3, segments[5], this.#state.fixed);
        this.#state.altitude = Number.parseFloat(Number(segments[9]).toFixed(this.#state.fixed));
        break;

      case "$GPGSA":
        // Operating details
        this.#state.sat.satellites = segments.slice(3, 15);
        this.#state.sat.pdop = Number(segments[15]);
        this.#state.sat.hdop = Number(segments[16]);
        this.#state.sat.vdop = Number(segments[17]);
        this.emit("operations", this.#state.sat);
        break;

      case "$GPRMC":
        // GPS & Transit data
        this.#state.time = new Date(now.getUTCFullYear(), now.getMonth(), now.getDay(), Number(segments[1].substring(0, 2)), Number(segments[1].substring(2, 4)), Number(segments[1].substring(4, 6)));
        this.#state.latitude = degToDec(segments[3], 2, segments[4], this.#state.fixed);
        this.#state.longitude = degToDec(segments[5], 3, segments[6], this.#state.fixed);
        this.#state.course = Number(segments[8]);
        this.#state.speed = toFixed(segments[7] * 0.514444, this.#state.fixed);
        break;

      case "$GPVTG":
        // Track Made Good and Ground Speed
        this.#state.course = Number(segments[1]);
        this.#state.speed = toFixed(segments[5] * 0.514444, this.#state.fixed);
        break;

      case "$GPGSV":
        // Satellites in view
        break;

      case "$PGACK":
        // Acknowledge command
        this.emit("acknowledge", sentence);
        break;

      default:
        this.emit("unknown", sentence);
        break;
    }

    this.emit("data", {
      latitude: this.#state.latitude,
      longitude: this.#state.longitude,
      altitude: this.#state.altitude,
      speed: this.#state.speed,
      course: this.#state.course,
      sat: this.#state.sat,
      time: this.#state.time
    });

    if (last.latitude !== this.#state.latitude ||
      last.longitude !== this.#state.longitude ||
      last.altitude !== this.#state.altitude) {

      this.emit("change", {
        latitude: this.#state.latitude,
        longitude: this.#state.longitude,
        altitude: this.#state.altitude
      });
    }

    if (last.speed !== this.#state.speed ||
      last.course !== this.#state.course) {

      this.emit("navigation", {
        speed: this.#state.speed,
        course: this.#state.course
      });
    }

  };

}

/*
 * Internal method used to convert degrees to decimal
 * @param {string} degrees - Degrees from NMEA sentence
 * @param {number} intDigitsLength - Length of the degrees value part fo the string
 * @param {string} cardinal - Cardinal direction [N, S, E, W]
 * @param {number} fixed - Max number of digits after the decimal in the returned value
 * @private
 */
function degToDec(degrees, intDigitsLength, cardinal, fixed) {
  if (degrees) {
    let decimal = Number(degrees.substring(0, intDigitsLength)) + Number(degrees.substring(intDigitsLength)) / 60;

    if (cardinal === "S" || cardinal === "W") {
      decimal *= -1;
    }
    return Number(decimal.toFixed(fixed));
  } else {
    return 0;
  }
}

/*
 * Internal method used to calculate NMEA chuecksum
 * @param {string} sentence - Sentence from GPS receiver
 * @private
 */
function getNmeaChecksum(sentence) {
  let cksum = 0x00;
  for (let i = 0; i < sentence.length; ++i) {
    cksum ^= sentence.charCodeAt(i);
  }
  cksum = cksum.toString(16).toUpperCase();

  if (cksum.length < 2) {
    cksum = ("00" + cksum).slice(-2);
  }

  return cksum;
}

/*
 * Internal method used to convert from string to array buffer
 * @param {string} str - String to convert
 * @private
 */
function str2ab(str) {
  let buf = new ArrayBuffer(str.length);
  let bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export default GPS;
