# Image_Processing_Toolkit
Code base for the web application of my image processing toolkit.

Setup Manual for Image Processing Toolkit
1. Install all the necessary modules (you will get some errors and it’s fine):
npm install
2. Edit the imagej modules. In the node_modules folder, navigate to the folder imagej, and
edit the index.js file like the following at java.asyncOptions:

```
if (!java.asyncOptions) {
   java.asyncOptions = {
   asyncSuffix: "Later",
   syncSuffix: "",
   promiseSuffix: "Promise",
   promisify: require("when/node").lift
   }
 }
 ```
 
3. Install ImageJ Fiji version: https://imagej.net/Downloads at ANY location. But remember
to change the path in the .env file.
4. Edit .env file.
5. Install Java JDK 1.8 and add it to the system variables path. After that, install Java JDK
13.0.1.
6. Install node-gyp globally:
npm i -g node-gyp
7. Install windows-build-tools using cmd or PowerShell as administrator:
npm i --global --production windows-build-tools
8. Add python 2.7 to the system variables path and set it in the settings of npm:
npm config set python /path/to/executable/python
9. Use node.js version 11.6.0 for compatibility
10. Run npm install again
npm install
11. Launch MongoDB at MongoDB location:
Mongod
12. Create uploads folder at the root directory
13. Run using npm start (not node server.js)
