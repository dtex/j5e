import ISL29125 from "@j5e/isl29125";

const color = await new ISL29125({
	sda: 4,
	scl: 5
});
