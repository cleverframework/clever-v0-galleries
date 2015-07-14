'use strict';

// Module dependencies.
const config = require('clever-core').loadConfig();
const mongoose = require('mongoose');
const Gallery = mongoose.model('Gallery');
const async = require('async');
const util = require('../util');

// Show gallery list
  exports.showGalleries = function(ImageGalleriesPackage, req, res, next) {
  let page = Number.parseInt(req.query.page);
  page = Number.isNaN(page) ? 0 : page;
  const skip = page * 10;

  function renderGalleryList(galleries, nGalleries) {
    res.send(ImageGalleriesPackage.render('admin/gallery/list', {
      packages: ImageGalleriesPackage.getCleverCore().getInstance().exportablePkgList,
      user: req.user,
      galleries: galleries,
      nGalleries: nGalleries,
      activePage: page,
      csrfToken: req.csrfToken()
    }));
  }

  async.parallel([
    function getGalleries(cb){
      Gallery.getGalleries(skip, 10)
        .then(function(galleries) {
          cb(null, galleries);
        })
        .catch(util.passNext.bind(null, cb));
    },
    function countGalleries(cb){
      Gallery.countGalleries()
        .then(function(nGalleries) {
          cb(null, nGalleries);
        })
        .catch(util.passNext.bind(null, cb));
    }
  ], function(err, options){
      if(err) return util.passNext.bind(null, next);
      renderGalleryList.apply(null, options);
  });

};

exports.showGallery = function(ImageGalleriesPackage, req, res, next) {
  function render(galleryToShow) {
    res.send(ImageGalleriesPackage.render('admin/gallery/details', {
      packages: ImageGalleriesPackage.getCleverCore().getInstance().exportablePkgList,
      user: req.user,
      galleryToShow: galleryToShow,
      csrfToken: req.csrfToken()
    }));
  }

  Gallery.getGalleryById(req.params.id)
    .then(render)
    .catch(util.passNext.bind(null, next));
};

exports.createGallery = function(ImageGalleriesPackage, req, res, next) {
  res.send(ImageGalleriesPackage.render('admin/gallery/create', {
    packages: ImageGalleriesPackage.getCleverCore().getInstance().exportablePkgList,
    user: req.user,
    csrfToken: req.csrfToken()
  }));
};

exports.editGallery = function(ImageGalleriesPackage, req, res, next) {
  function render(galleryToEdit) {
    res.send(ImageGalleriesPackage.render(`admin/gallery/edit`, {
      packages: ImageGalleriesPackage.getCleverCore().getInstance().exportablePkgList,
      user: req.user,
      galleryToEdit: galleryToEdit,
      csrfToken: req.csrfToken()
    }));
  }

  Gallery.getGalleryById(req.params.id)
    .then(render)
    .catch(util.passNext.bind(null, next));
};
