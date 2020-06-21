## j5e Repo Anatomy
One goal of j5e is write once, run anywhere. We are building toward this goal before most TC-53 IO conformant platforms exist. To that end, the structure of this repo may change to help us support more platforms. The JS is the same across platforms, but the different implementations of ECMAScript Modules may require special concessions (package.json vs manifest.json and inconsistent module resolution schemes).

### Special Scaffolding
j5e is designed to import just the parts it needs, so subpath exports are absolutely necessary. To make everything play nice, you will need to symlink your dev folder to itself. From your root run ```npm link``` and then ```npm link j5e```. This will allow tests to include subpaths, and for subpaths to include their siblings.

### Documentation
[Documentation](https://dtex.github.io/j5e/) is handled using [JSDoc](https://jsdoc.app/). Nothing in the ```./docs/``` folder should be edited directly. It is generated from comments in the code and some miscellaneous files in the ```./build/docs/``` folder. To generate new documentation run ```npm run docs```. Note that this can only be done outside the individual package folders.

### Tests
Tests are run using Mocha, Sinon, and node built-in Assert module. Each class has its own js file in the ```./tests/``` folder. You can test a single class by running ```npm run test <class>```. You can run all tests by running ```npm run test```.