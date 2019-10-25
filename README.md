# Embedded-JS
Embedded-JS is a device framework for providers using TC-53's IO pattern. Right now, that's only Moddable's IO module for XS, but we should see more soon. This is the recommended method but if you prefer to use a package manager, check out these [instructions for using npm](docs/using-npm.md). 

## Usage
This library is pretty easy to use, but getting your machine configured can be a bit of a chore. Don't worry though, the process is well documented.

1. Make sure you have successfully [configured your host environment](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/Moddable%20SDK%20-%20Getting%20Started.md) for the Moddable SDK. 

2. Download the embedded-js devices repository, or use the git command line tool as follows:

**macOS	and Linux**
````bash
cd ~/Projects
git clone https://github.com/embedded-js/devices
````

**Windows**
````bash
cd C:\Users\<user>\Projects
git clone https://github.com/embedded-js/devices
````

3. Setup the EMBEDDEDJS environment variable to point at the directory:

**macOS**
````bash
export EMBEDDEDJS="/Users/<user>/Projects/devices/packages"
````

**Linux**
````bash
EMBEDDEDJS=~/Projects/devices/packages
export EMBEDDEDJS
````

**Windows**
````bash
set EMBEDDEDJS=C:\Users\<user>\Projects\devices\packages
````

## Write an Embedded Program

1. Create a working directory (You can call it whatever you want):

````bash
mkdir myProject
````

2. Navigate into your working directory:

````bash
cd myProject
````

3. Create a manifest.json file in your working directory:

````js
{
	"include": [
		"$(MODDABLE)/modules/io/manifest.json",
		"$(EMBEDDEDJS)/devices/manifest.json"
	],
	"modules": {
		"*": [
			"./main"
		]
	}
}
````

4. Create you main.js program file (note that the name of the file matches the value in ```modules``` from the previous step). Here's the ubquitous "Hello World" for hardware to get you started:

````js
import Digital from "builtin/digital";
import Led from "@embedded/led";

const led = new Led(digital, 14);

led.blink();
````

5. Now you're ready to build your program for your platform (refer back to the [Moddable docs](https://github.com/Moddable-OpenSource/moddable/tree/public/examples#building-apps) for help with this):

````bash
mcconfig -d -m -p esp
````
