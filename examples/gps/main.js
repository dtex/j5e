import GPS from "j5e/gps";
import { timer } from "j5e/fn";

(async() => {
  const gps = await new GPS([17, 16]);

  gps.on("change", data => {
    trace(`
  Latitude: ${data.latitude}
  Longitude: ${data.longitude}
  Altitude: ${data.altitude}`);
  });

})();
