## j5e Repo Anatomy
One goal of j5e is write once, run anywhere. We are building toward this goal before ECMA-419 conformant platforms exist. To that end, the structure of this repo may change to help support more platforms. The JS is the same across platforms, but the different implementations of ECMAScript Modules may require special concessions (package.json vs manifest.json and varying module resolution schemes for example).

### Special Scaffolding
j5e is designed to import just the parts it needs, so subpath exports in node.js are absolutely necessary. To make everything link up you will need to symlink your dev folder to itself. From the root run ```npm link``` and then ```npm link j5e```. This will allow tests to import subpaths, and for subpaths to import their siblings.

### Documentation
[Documentation](https://j5e.dev/) is handled using [Eleventy](https://www.11ty.dev/) and [JSDoc](https://jsdoc.app/). It is generated from comments in the code and is managed in the J5e-Docs repo](https://github.com/dtex/j5e-docs). 

### Tests
Tests are run using Mocha, Chai,  Sinon, and node's built-in Assert module. Each class has its own js file in the ```./tests/``` folder. You can run tests by running ```npm run test``` or on a specific module by running ```npm run test ./test/rgb``` for example.

**Test Organiztion**
Test files should be organized with the heirarchy described in [/build/templates/test.js](build/templates/test.js).
