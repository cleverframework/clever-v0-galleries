'use strict';

// Dependencies
let router = require('express').Router();

// Require CleverCore
let CleverCore = require('clever-core');

// Load config
let config = CleverCore.loadConfig();

// Load controller
let imageGalleryApiCtrl = require('../controllers/image-gallery-api');

// Exports
module.exports = function(ImageGalleryPackage, app, auth, storage) {

  /**
   * Gallery
   */

  // Get galleries
  router.get('/', imageGalleryApiCtrl.getGalleries);

  // Get gallery by id
  router.get('/:id', imageGalleryApiCtrl.getGalleryById);

  // Get gallery by slug
  router.get('/:slug', imageGalleryApiCtrl.getGalleryBySlug);

  // Create new gallery
  router.post('/', auth.requiresAdmin, imageGalleryApiCtrl.createGallery);

  // Edit gallery
  router.put('/:id', auth.requiresAdmin, imageGalleryApiCtrl.editGalleryById);

  // Delete gallery
  router.delete('/:id', auth.requiresAdmin, imageGalleryApiCtrl.deleteGalleryById);

  // Get gallery images by galleryId
  router.get('/:galleryId/images', imageGalleryApiCtrl.getGalleryImagesByGalleryId);

  // Get gallery images by gallerySlug
  router.get('/:gallerySlug/images', imageGalleryApiCtrl.getGalleryImagesByGallerySlug);

  // Add images to gallery
  router.post('/:galleryId/images', auth.requiresAdmin, imageGalleryApiCtrl.addGalleryImages));

  // Delete images to gallery
  router.post('/:galleryId/images', auth.requiresAdmin, imageGalleryApiCtrl.deleteGalleryImages));


  /**
   * Image
   */

  // Get galleries (/images?tags[]=clever&tags[]=awesome)
  router.get('/images', imageGalleryApiCtrl.getImages);

  // Get gallery by id
  router.get('/images/:id', imageGalleryApiCtrl.getImageById);

  // Edit gallery image
  router.put('/images/:id', auth.requiresAdmin, imageGalleryApiCtrl.editGalleryImageById.bind(null, storage));

  // Delete gallery image
  router.delete('/images/:id', auth.requiresAdmin, imageGalleryApiCtrl.deleteGalleryImageById.bind(null, storage));


  return new CleverCore.CleverRoute(router, 'api', false);

};
