# J5e – Johnny Five for Embedded Systems
J5e is a device framework built for ECMA TC-53's IO pattern. Right now, that's only Moddable's IO module for XS, but we should see more soon. This is the recommended method but if you prefer to use a package manager, check out these [instructions for using npm](docs/using-npm.md). 

This project is very much in a "pre-alpha" form so use at your own risk.

## Usage
This library is pretty easy to use, but getting your machine configured can be a bit of a chore. Don't worry though, the process is well documented.

### 1. Make sure you have successfully [configured your host environment](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/Moddable%20SDK%20-%20Getting%20Started.md) for the Moddable SDK. 
---
### 2. Download the [J5e repository](https://github.com/dtex/J5e/archive/master.zip), or use the git command line tool as follows:

**macOS	and Linux**
````bash
cd ~/Projects
git clone https://github.com/dtex/J5e
````

**Windows**
````bash
cd C:\Users\<user>\Projects
git clone https://github.com/dtex/J5e
````
---
### 3. Setup the J5e environment variable to point at the directory:

**macOS**
````bash
export J5e="/Users/<user>/Projects/J5e/modules"
````

**Linux**
````bash
J5e=~/Projects/J5e/modules
export J5e
````

**Windows**
````bash
set J5e=C:\Users\<user>\Projects\J5e\modules
````
---
## Write an Embedded Program

### 1. Create a working directory (You can call it whatever you want):

````bash
mkdir myProject
````

### 2. Navigate into your working directory:

````bash
cd myProject
````

### 3. Create a manifest.json file in your working directory:

````js
{
	"include": [
		"$(MODDABLE)/modules/io/manifest.json",
		"$(J5e)/manifest.json"
	],
	"modules": {
		"*": [
			"./main"
		]
	}
}
````

### 4. Create you main.js program file. Here's the ubquitous "Hello World" for hardware to get you started:

````js
import Led from "@J5e/led";

(async function() {
	const led = await new Led(14);
	led.blink();
})();
````

### 5. Now you're ready to build your program for your platform (refer back to the [Moddable docs](https://github.com/Moddable-OpenSource/moddable/tree/public/examples#building-apps) for help with this):

````bash
mcconfig -d -m -p esp
````
