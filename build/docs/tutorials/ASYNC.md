Users of Johnny-Five may recall that asynchronous functionality was handled through the use of event listeners. Take this Johnny-Five "Hello World" example:

````js
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  
  // Yay, the board is ready! Now I can run my program
  var led = new five.Led(13);
  
  led.blink(500);

});
````

We can't instantiate our LED before the board is ready, so we wait for the board's ready event to fire and then run our program. 

Things have changed. The challenge of having to wait for I/O to be ready remains, but now we handle it with promises and async/await. The trick is that in order to ```await``` for a call to return, the code must be wrapped in an ```async``` function. The simplest way to do this is with an "asynchronous immediately invoked function expression" or "AIIFE". The AIIFE wraps our program so we can use ```await``` on our initialization calls. 

````js
import Led from "@j5e/led";

(async function() {

  const led = await new Led(13);
  // Yay, the I/O is ready! Now I can run my program

  led.blink(500);

})();
````
Maybe one day we'll be able to use await at the top level without the AIIFE and our code will be more concise but for now we must wrap our programs with:

````js
(async function() {
  // ...
})();
````
If you're unclear about this bit of computer vomit, perhaps this breakdown will help...

It is commont to assign function expression to a variable in the global namespace, and then call it later:
````js
// Function expression assigned to global "foo"
const foo = function() { 
  // ...
};

foo();
````
But an anonymous function is fine here so we leave off the variable assignment:
````js
// Anonymous function in the global namespace (error)
function() {
  // ...
};
````
But that throws an error because we can't have an anonymous function floating around in the global namespace. To get aroung this we wrap it with a grouping operator:

````js
(function() { 
  // ...
});
````
That works! The grouping operater gives the function a scope, but the scope closes immediately and our program forgets about the function without ever actually executing it. 

We want to make sure that the function runs so we add parens after the grouping operator to *immediately invoke* the method:
````js
(function() { 
  // ...
})();
````
It runs! Now one last thing... In order to be able to use await within our anonymous function, it has to be an async function, so we end up with:
````js
(async function() { 
  // ...
})();
````
and now we can ```await``` all the things.