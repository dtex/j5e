# Getting Started (Moddable XS)

#### 1. Make sure you have successfully [configured your host environment](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/Moddable%20SDK%20-%20Getting%20Started.md) for the Moddable SDK. 

#### 2. Clone the j5e repository

````bash
cd ~/Projects
git clone https://github.com/Moddable-OpenSource/moddable
````

#### 3. Setup the ```j5e``` environment variable to point at the ```dist/moddable``` directory in your copy of the j5e repo

````bash
export j5e="/Users/<user>/Projects/j5e/dist/moddable"
````


#### 4. Create a working directory (You can call it whatever you want):

````bash
cd ~/Projects
mkdir myProject
````

#### 5. Navigate into your working directory:

````bash
cd myProject
````

#### 6. Create a manifest.json file in your working directory:

````js
{
	"include": [
		"$(MODDABLE)/modules/io/manifest.json",
		"$(j5e)/manifest.json"
	],
	"modules": {
		"*": [
			"./main"
		]
	}
}
````

#### 7. Create you ```main.js``` program file. Here's the ubquitous "Hello World" for hardware to get you started:

````js
import Led from "@j5e/led";

(async function() {
	const led = await new Led(14);
	led.blink();
})();
````

#### 8. Now you're ready to build your program (refer back to the [Moddable docs](https://github.com/Moddable-OpenSource/moddable/tree/public/examples#building-apps) for help with this):

````bash
mcconfig -d -m -p esp
````