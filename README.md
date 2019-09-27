# embedded
Framework for embedded devices using TC-53's IO pattern.

# Usage
Using this library is pretty easy, but it getting the supporting tools on your machine can be a bit of a chore. Don't worry the process is pretty well documented.

## Prepare your system
Make sure you have successfully [configured your host environment](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/Moddable%20SDK%20-%20Getting%20Started.md) for the Moddable SDK. 

^ That one line was the hardest part.

Install node.js from [https://nodejs.org/en/](https://nodejs.org/en/). You don't actually need node.js unless you want to be able to develop for and test this project. What we're really after is npm, node's package manager which is bun`dled with node.js.

## Create a Working Directory
Create a new directory for your project. Call it whatever you want.
````bash
mkdir myProject
````

Navigate into your project directory.
````bash
cd myProject
````

## Set Up Your package.json File
Initialize your project with a package.json. This is important because it let's npm know:
1. Where to install your packages.
2. What packges your project needs to function.

````bash
npm init -y
````
The ```-y``` here is optional. That just tells npm to initialize your package.json using all the defaults. The is probably fine unless you are building a package you intend to distribute through npm. If that's the case you'll want to leave off the ```-y``` and respond to all the prompts.

## Set Up Your manifest.json File
npm needed package.json to do its job and the Moddable SDK needs its own, similar, file as well. Moddable needs to know where your project's dependencies are stored and since we're not building a node.js app, it's not going to automatically look in ```node_modules```. 

Using your favorite text editor, create a file called ```manifest.json``` in the root of your working directory. Paste this into that file:
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
Under includes we have the path to Moddable's IO module. This is Moddable's interface that follows the TC-53 IO standard. After that we have the path to the embedded-js devices package.

If this all seems a little redundant, that's because it totally is. Hopefully soon we'll have a package manager for XS that lets us have just a manifest.json file and no packge.json (or npm for that matter).

## Install This Project as a Dependency
This is why package managers are cool.
````bash
npm install @embedded/devices
````
This line grabs the embbedded-js device package and all of its dependencies, puts them in a new ```node_modules``` directory in your working directory, and if all that was successful it adds the dependency in your package.json file. In case you're wondering, the ```@embedded``` part is the name of the npm organization all embedded-js packages are kept in. Most packages are not stored under organizations.

## Add Your Program
In your project directory create a file called main.js and add the following code (update the pin number to match your hardware):

````js
import Digital from "builtin/digital";
import Led from "@embedded/led";

const io = new Digital({
  pin: 14,
  mode: Digital.Output
});

const led = new Led(io);

led.blink();
````

Now you're ready to build your program for your platform (refer back to the Moddable docs for this).



