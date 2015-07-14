'use strict';

const cleverCore = require('clever-core');
const Package = cleverCore.Package;

// Defining the Package
const GalleriesPackage = new Package('galleries');

// All CLEVER packages require registration
GalleriesPackage.register(function(app, auth, database, storage) {

  ImageGalleriesPackage.routes(app, auth, database, storage);

  return ImageGalleriesPackage;

});
