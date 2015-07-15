'use strict';

// Module dependencies.
const mongoose = require('mongoose');
const Gallery = mongoose.model('Gallery');
const async = require('async');
const config = require('clever-core').loadConfig();
const request = require('request');
const util = require('../util');

// Send logged gallery
exports.me = function(req, res) {
  util.sendObjectAsHttpResponse(res, 200, req.gallery || null);
};

// Find all gallery
exports.getGalleries = function(req, res, next) {
  Gallery.getGalleries(req.query.start, req.query.limit)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 200))
    .catch(util.passNext.bind(null, next));
};

// Find gallery by id
exports.getGallery = function(req, res, next) {
  Gallery.getGalleryById(req.params.id)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 200))
    .catch(util.passNext.bind(null, next));
};

// Create gallery
exports.createGallery = function(req, res, next) {

  req.assert('title', 'Gallery must have a title of not more then 32 characters').notEmpty().len(1, 32);
  req.assert('slug', 'Gallery must have a slug of not more then 32 characters').notEmpty().len(1, 32);
  req.assert('comment', 'Comment must have max 64 characters').optional().len(0, 64);

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json(errors);
  }

  Gallery.createGallery(req.body)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 201))
    .catch(util.sendObjectAsHttpResponse.bind(null, res, 400));
};

// Edit gallery logged gallery id
exports.editGallery = function(req, res, next) {

  req.assert('title', 'Gallery must have a title of not more then 32 characters').notEmpty().len(1, 32);
  req.assert('slug', 'Gallery must have a slug of not more then 32 characters').notEmpty().len(1, 32);
  req.assert('comment', 'Comment must have max 64 characters').optional().len(0, 64);

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json(errors);
  }

  Gallery.editGalleryById(req.params.id, req.body)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 202))
    .catch(util.sendObjectAsHttpResponse.bind(null, res, 400));
};

// Delete gallery by id
exports.deleteGallery = function(req, res, next) {
  Gallery.deleteGalleryById(req.params.id)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 202))
    .catch(util.passNext.bind(null, next));
};

exports.addGalleryImages = function(req, res, next) {
  const forward = request.post(`${config.app.url}/api/files`, function handleResponse(err, httpResponse, body) {
    if (err) return next(err);
    const parsedBody = JSON.parse(body);
    if(httpResponse.statusCode > 299) return res.status(httpResponse.statusCode).json(parsedBody);

    Gallery.addGalleryImagesByGalleryId(req.params.galleryId, parsedBody)
      .then(util.sendObjectAsHttpResponse.bind(null, res, 201, parsedBody))
      .catch(util.sendObjectAsHttpResponse.bind(null, res, 400));

  });
  req.pipe(forward);
};

// exports.deleteGalleryImage = function(req, res, next) {
//   const forward = request({
//     method: 'DELETE',
//     uri: `${config.app.url}/api/files/${imageId}`,
//   }, function handleResponse(err, httpResponse, body) {
//     if (err) return next(err);
//     const parsedBody = JSON.parse(body);
//     if(httpResponse.statusCode > 299) return res.status(httpResponse.statusCode).json(parsedBody);
//
//     Gallery.addGalleryImagesByGalleryId(req.params.galleryId, parsedBody)
//       .then(util.sendObjectAsHttpResponse.bind(null, res, 201, parsedBody))
//       .catch(util.sendObjectAsHttpResponse.bind(null, res, 400));
//
//   });
//   req.pipe(forward);
// };
