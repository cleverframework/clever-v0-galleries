'use strict';

let cleverCore = require('clever-core');
let Package = cleverCore.Package;

// Defining the Package
var ImageGalleryPackage = new Package('users-ssh');

// All CLEVER packages require registration
ImageGalleryPackage.register(function(app, auth, database, storage) {

  ImageGalleryPackage.routes(app, auth, database, storage);

  return ImageGalleryPackage;

});
