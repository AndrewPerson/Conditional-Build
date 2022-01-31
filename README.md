# Conditional Build

## Description

This plugin (for esbuild) allows you conditionally exclude or include parts of javascript (or typescript) files at build time. You use `//#if`, `//#else`, and `//#endif` to do this.

## Setup

To install through NPM run this command:
```
npm i esbuild-plugin-conditional-build
```

Any files you use this plugin in will need to have the extension `.mjs` instead of `.js`.

## Usage

```js
//build.js

//Import the conditional build
import conditionalBuild from "esbuild-plugin-conditional-build";

//Setup esbuild
import { build } from "esbuild";

build({
    entryPoints: ["src/foo.js"],
    outdir: "dist",
    plugins: [
        //Define the DEVELOPMENT constant
        conditionalBuild(["DEVELOPMENT"])
    ]
})
```

```js
//src/foo.js
//#conditional

//#if DEVELOPMENT
console.log("Development!");
//#else
console.log("Production.");
//#endif
```

**Note that you must have `//#conditional` at the very start of your file.**

After running `node build.js` `dist/foo.js` will look like this:
```js
console.log("Development!");
```

The comments and the production code have been stripped.
Conversely, if we ran `build.js` without `"DEVELOPMENT"` being passed into `conditionalBuild`, the development code would be stripped and the production code would remain.
