j5e is a device framework built for [ECMA TC-53's](https://www.ecma-international.org/memento/tc53.htm) I/O class pattern. The [I/O class pattern](https://gist.github.com/phoddie/166c9c17b2f31d0beda9f2410a219268) is a standard interface for accessing underlying hardware interfaces (GPIO). j5e's API is based on the [Johnny-Five](https://github.com/rwaldron.johnny-five) API which has been battle tested over quite some time. 

Right now, the only provider that matches the ECMA TC-53 I/O class pattern is [Moddable's IO module for XS](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/io/io.md) which runs on the ESP8266. Hopefully, we will see more soon. 

*This project is very much in a "pre-alpha" state so use at your own risk.*

**j5e in action**
````js
import LED from "@j5e/led";

(async function() {
  const led = await new LED(14);
  led.blink();
})();
````

New users should check out the [Getting Started](tutorial-GETSTARTED.html) guide.

## j5e Repo Anatomy
One goal of j5e is write once, run anywhere. We are building toward this goal before most TC-53 IO conformant platforms exist. To this end we've settled on node.js compatability as our primary target, with a build step that will generate distributions for other platforms programmatically. The JS is the same across platforms, but the project structure has to change in order to work with different implementations of ECMAScript Modules (package.json vs manifest.json and inconsistent module resolution schemes).

### It's a Mono-Repo
In order to resolve module paths by ```namespace/modulename``` in node.js (eg ```import LED from "@j5e/led";```), each module needs to be its own package under the ```@j5e``` namespace. The ```@j5e``` namespace is an npm organization. Rather than having a seperate repo for what could end up being hundreds of modules we're using lerna to manage the different packages. Each module/package is contained in its own directory within ```./packages/```. If you've cloned the repo and need to do some work on it, make sure you run ```lerna bootstrap``` to get all the dependencies wired up properly and then run ```npm install``` to get all the packages needed for dev.

### Documentation
[Documentation](https://dtex.github.io/j5e/) is handled using [JSDoc](https://jsdoc.app/). Nothing in the ```./docs/``` folder should be edited directly. It is generated from comments in the code and some miscellaneous files in the ```./build/docs/``` folder. To generate new documentation run ```npm run docs```. Note that this can only be done outside the individual package folders.

### Tests
Tests are run using mocha and chai. Each package has its own js file in the ```./tests/``` folder. You can test a single package by navigating to the package folder and running ```npm run test```. You can run all tests from anywhere in the repo by running ```lerna run test```.

### Build Process
Creating new builds for the ```./dist/``` folder is handled with simple node.js scripts (no task runner). A build script is necessary for every platform except node.js. To generate new dists, just run ```npm run dist```. Note that this can only be done outside the individual package folders.