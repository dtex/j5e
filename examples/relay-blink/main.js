import Relay from "j5e/relay";
import { timer } from "j5e/fn";

const relay = await new Relay(14);

timer.setInterval(function() {
  relay.toggle();
}, 1000);