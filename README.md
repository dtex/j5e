# j5e – Johnny Five for Embedded Systems
j5e is a device framework built for ECMA TC-53's IO pattern. Right now, that's only Moddable's IO module for XS, but we should see more soon. This is the recommended method but if you prefer to use a package manager, check out these [instructions for using npm](docs/using-npm.md). 

This project is very much in a "pre-alpha" form so use at your own risk.

## Get Started

### 1. Make sure you have successfully [configured your host environment](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/Moddable%20SDK%20-%20Getting%20Started.md) for the Moddable SDK. 

### 2. Create a working directory (You can call it whatever you want):

````bash
mkdir myProject
````

### 3. Navigate into your working directory:

````bash
cd myProject
````

### 4. Initialize this directory for npm:

````bash
npm init -y
````

### 5. Install J5e using npm:

````bash
npm install j5e
````

### 6. Create a manifest.json file in your working directory:

````js
{
	"include": [
		"$(MODDABLE)/modules/io/manifest.json",
		"./node_modules/j5e/manifest.json"
	],
	"modules": {
		"*": [
			"./main"
		]
	}
}
````

### 7. Create you main.js program file. Here's the ubquitous "Hello World" for hardware to get you started:

````js
import Led from "@j5e/led";

(async function() {
	const led = await new Led(14);
	led.blink();
})();
````

### 8. Now you're ready to build your program (refer back to the [Moddable docs](https://github.com/Moddable-OpenSource/moddable/tree/public/examples#building-apps) for help with this):

````bash
mcconfig -d -m -p esp
````
