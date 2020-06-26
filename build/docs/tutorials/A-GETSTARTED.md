## This tutorial is for using J5e with the Moddable SDK. 

#### 1. Make sure you have successfully [configured your host environment](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/Moddable%20SDK%20-%20Getting%20Started.md) for the Moddable SDK. 

#### 2. Get the J5e repository

There are a few ways to do this. 

You can clone the repo:
````bash
cd ~/Projects
git clone https://github.com/dtex/j5e
````

- or -

You can [download the latest release](https://github.com/dtex/j5e/releases) from Github.

- or -

You can install it from npm with ```npm install j5e```.

#### 3. Setup the ```j5e``` environment variable to point at your ```j5e``` directory

````bash
export j5e="/Users/<user>/Projects/j5e"
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

#### 6. Create a ```manifest.json``` file in your working directory:

````js
{
  "include": [
    "$(MODDABLE)/modules/io/manifest.json",
    "$(j5e)/lib/led/manifest.json"
  ],
  "modules": {
    "*": [
      "./main"
    ]
  }
}
````

#### 7. Create your ```main.js``` program file. Here's the ubquitous "Hello World" for hardware to get you started:

````js
import LED from "j5e/led";

const led = await new LED(14);
led.blink();
````

#### 8. Now you're ready to build your program and upload it to your microcontroller (refer to the [Moddable docs](https://github.com/Moddable-OpenSource/moddable/tree/public/examples#building-apps) for help with this):

````bash
mcconfig -d -m -p esp
````