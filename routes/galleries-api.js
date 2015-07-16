'use strict';

// Dependencies
const router = require('express').Router();

// Require CleverCore
const CleverCore = require('clever-core');

// Load config
const config = CleverCore.loadConfig();

// Load controller
const galleriesApiCtrl = require('../controllers/galleries-api');

// Exports
module.exports = function(ImageGalleriesPackage, app, auth, database, storage) {

  /**
   * Gallery
   */

  // Get galleries
  router.get('/', galleriesApiCtrl.getGalleries);

  // Get gallery by id
  router.get('/:id', galleriesApiCtrl.getGallery);

  // // Get gallery by slug
  // router.get('/:slug', galleriesApiCtrl.getGalleryBySlug);

  // Create new gallery
  router.post('/', auth.requiresAdmin, galleriesApiCtrl.createGallery);

  // // Edit gallery
  router.put('/:id', auth.requiresAdmin, galleriesApiCtrl.editGallery);

  // Delete gallery
  router.delete('/:id', auth.requiresAdmin, galleriesApiCtrl.deleteGallery);

  // // Get gallery images by galleryId
  // router.get('/:galleryId/images', galleriesApiCtrl.getGalleryImagesByGalleryId);
  //
  // // Get gallery images by gallerySlug
  // router.get('/:gallerySlug/images', galleriesApiCtrl.getGalleryImagesByGallerySlug);

  // Add images to gallery
  router.post('/:galleryId/images', auth.requiresAdmin, galleriesApiCtrl.addGalleryImages);

  // // Delete image to gallery by id
  // router.post('/:galleryId/images/:imageId', auth.requiresAdmin, galleriesApiCtrl.deleteGalleryImage));

  return new CleverCore.CleverRoute(router, 'api', false);

};
