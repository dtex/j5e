## j5e Repo Anatomy
One goal of j5e is write once, run anywhere. We are building toward this goal before TC-53 IOCP conformant platforms exist. To that end, the structure of this repo may change to help us support more platforms. The JS is the same across platforms, but the different implementations of ECMAScript Modules may require special concessions (package.json vs manifest.json and varying module resolution schemes).

### Special Scaffolding
j5e is designed to import just the parts it needs, so subpath exports in node.js are absolutely necessary. To make everything link up you will need to symlink your dev folder to itself. From the root run ```npm link``` and then ```npm link j5e```. This will allow tests to import subpaths, and for subpaths to import their siblings.

### Documentation
[Documentation](https://dtex.github.io/j5e/) is handled using [JSDoc](https://jsdoc.app/). Nothing in the ```./docs/``` folder should be edited directly. It is generated from comments in the code and some miscellaneous files in the ```./build/docs/``` folder. To generate new documentation run ```npm run docs```.

### Tests
Tests are run using Mocha, Chai,  Sinon, and node's built-in Assert module. Each class has its own js file in the ```./tests/``` folder. You can run tests by running ```npm run test``` or on a specific module by running ```npm run test ./test/rgb``` for example.

**Test Organiztion**
Test files should be organized with the following heirarchy

````js
describe('Switch', function() {. // Class name at top level
  
  describe('Instantiation', function() {
    // All tests related to default instantiation 
    describe('sink', function() { 
      it('should be configured for sink drive', async function() {
        // ...
      });
      // [ All other tests related to sink ]
    }
    // [ All other options, each with it's own describe ]
  }

  describe('Properties', function() {
    describe('isClosed', function() {
      it('should report isClosed === true when pin is high', async function() {
        // ...
      });
      // [ all other tests related to isClosed ]
    });
    // [ All other properties, each with it's own describe ]
  });
  
  describe('Methods', function() {
    describe('doSomething', function() {
      it('should doSomething', async function() {
        // ...
      });
    // [ all other tests related to doSomething ]
    });
    // [ All other methods, each with it's own describe ]
  });
  
  describe('Events', function() {
    describe('close', function() {
      it('should fire "close" when a pin goes high', async function() {
        // ...
      });
      // [ all other tests related to close ]
    });
    // [ All other Events, each with it's own describe ]
  });

});
````
