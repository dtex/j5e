import RGB from "j5e/rgb";

(async() => {
  const rgb = await new RGB([13, 12, 14]);
  rgb.color("#663399");
  rgb.pulse();
})();
