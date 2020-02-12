const fs = require("fs-extra");

const target = "./dist/moddable";

// Let's start with a clean slate
fs.emptyDirSync(target);

// Load the manifest template
const manifestTemplate =  fs.readFileSync("./build/templates/moddable-manifest.json");

// This will be the top level manifest used when including all of j5e
const j5eManifest = JSON.parse(manifestTemplate);

// Get a list of packages
const packages = fs.readdirSync("./packages");

packages.forEach(package => {
  // Add to the top level manifest
  j5eManifest.modules[`@j5e/${package}`] = `$(j5e)/${package}/*`;

  // Create the module directory in dist/moddable
  fs.mkdirSync(`${target}/${package}`);

  // Create a new module specific manifest file
  let manifest = JSON.parse(manifestTemplate);
  
  // Get a list of the dependencies from package.json
  const packageFile =  fs.readFileSync(`./packages/${package}/package.json`);
  const packageJSON = JSON.parse(packageFile);
  const dependencies = packageJSON.dependencies;
  
  // Add each dependency as a module in the manifest
  Object.keys(dependencies).forEach(dependency => {
    let dependencyPath = dependency.replace("@j5e/", "$(j5e)/");
    manifest.modules[dependency] = dependencyPath + "/*";
  });
  
  // Add the main file to modules in manifest
  manifest.modules["@j5e/led"] = (`$(j5e)//${package}/*`);
  
  // Publish the module manifest
  fs.writeFileSync(`${target}/${package}/manifest.json`, JSON.stringify(manifest, null, 2));

  // Copy the main file to the module dist folder
  fs.copySync(`./packages/${package}/${packageJSON.main}`, `${target}/${package}/${packageJSON.main}`);

});

// write the main manifest file
fs.writeFileSync(`${target}/manifest.json`, JSON.stringify(j5eManifest, null, 2));
  