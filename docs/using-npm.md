# Embedded-JS with npm
Embedded-JS is a device framework for providers using TC-53's IO pattern. Right now, that's only Moddable's IO module, but we should see more soon. These instructions explain how to use Embedded-JS with npm. Unless you are deadset on using npm, you should probably follow [these instructions](../../../) instead.

## Usage
This library is pretty easy to use, but getting your machine configured can be a bit of a chore. Don't worry though, the process is well documented.

1. Install node.js from [https://nodejs.org/en/](https://nodejs.org/en/). You don't actually need node.js unless you want to be able to develop for and test this project. What we're really after is npm, node's package manager which is bun`dled with node.js.

1. Create a working directory (You can call it whatever you want):

````bash
mkdir myProject
````

2. Navigate into your working directory:

````bash
cd myProject
````

3. Set Up Your package.json File

    Initialize your project with a package.json. This is important because it let's npm know:
   * Where to install your packages.
   * What packges your project needs to function.

````bash
npm init -y
````

    The ```-y``` here is optional. It just tells npm to initialize your package.json using all the defaults. The is probably fine unless you are building a package you intend to distribute through npm. If that's the case you'll want to leave off the ```-y``` and respond to all the prompts.

4. Set Up Your manifest.json File

    npm needed package.json to do its job and the Moddable SDK needs its own, similar, file as well. Moddable needs to know where your project's dependencies are stored and since we're not building a node.js app, it's not going to automatically look in ```node_modules```. 

    Using your favorite text editor, create a file called ```manifest.json``` in the root of your working directory. Paste this into that file
````js
{
	"include": [
		"$(MODDABLE)/modules/io/manifest.json",
		"./node_modules/@embedded/devices/manifest.json"
	],
	"modules": {
		"*": [
			"./main"
		]
	}
}
````
Under includes we have the path to Moddable's IO module. This is Moddable's interface that follows the TC-53 IO standard. After that we have the path to the embedded-js devices package that will be installed in this directory.

If this all seems a little redundant, that's because it totally is. Hopefully soon we'll have a package manager for XS that lets us have just a manifest.json file and no packge.json (or npm for that matter).

5.  Install This Project as a dependency

     This is why package managers are cool.
````bash
npm install @embedded/devices
````

This line grabs the embbedded-js device package and all of its dependencies, puts them in a new ```node_modules``` directory in your working directory, and if all that was successful it adds the dependency in your package.json file. In case you're wondering, the ```@embedded``` part is the name of the npm organization all embedded-js packages are kept in. Most packages are not stored under organizations.

6. Create your main.js program file (note that the name of the file matches the value in ```modules``` from the previous step). 

Here's the ubquitous "Hello World" for hardware to get you started:

````js
import Digital from "builtin/digital";
import Led from "@embedded/led";

const led = new Led(Digital, 14);

led.blink();
````

5. Now you're ready to build your program for your platform (refer back to the [Moddable docs](https://github.com/Moddable-OpenSource/moddable/tree/public/examples#building-apps) for help with this):

````bash
mcconfig -d -m -p esp
````