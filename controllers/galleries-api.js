'use strict';

// Module dependencies.
const mongoose = require('mongoose');
const Gallery = mongoose.model('Gallery');
const async = require('async');
const config = require('clever-core').loadConfig();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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
exports.getGalleryById = function(req, res, next) {
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
exports.editGalleryById = function(req, res, next) {

  // Optionals
  req.assert('firstName', 'You must enter your first name').optional().notEmpty();
  req.assert('lastName', 'You must enter your last name').optional().notEmpty();
  req.assert('firstName', 'Firstname cannot be more than 32 characters').optional().len(1, 32);
  req.assert('lastName', 'Lastname cannot be more than 32 characters').optional().len(1, 32);
  req.assert('email', 'You must enter a valid email address').optional().isEmail();
  req.assert('password', 'Password must be between 8-20 characters long').optional().len(8, 20);

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json(errors);
  }

  Gallery.editGalleryById(req.params.id, req.body)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 202))
    .catch(util.sendObjectAsHttpResponse.bind(null, res, 400));
};

// Edit logged gallery
exports.editLoggedGallery = function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.status(401).json([{
      message: 'Gallery Unauthorized',
      status: 401
    }]);
  }

  req.params.id = req.gallery._id;
  req.body.admin = req.gallery.isAdmin();
  exports.editGalleryById(req, res, next);
};

// Delete gallery by id
exports.deleteGalleryById = function(req, res, next) {
  Gallery.deleteGalleryById(req.params.id)
    .then(util.sendObjectAsHttpResponse.bind(null, res, 202))
    .catch(util.passNext.bind(null, next));
};
