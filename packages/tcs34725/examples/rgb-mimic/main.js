import TCS34725 from "@j5e/tcs34725";

const color = await new TCS34725({
	sda: 4,
	scl: 5
});