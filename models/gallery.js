'use strict';

// Module dependencies.
const cleverCore = require('clever-core');
const storage = cleverCore.loadStorage();
const mongoose = require('mongoose');
const Schema  = mongoose.Schema;
const _ = require('lodash');
const Q = require('q');
const async = require('async');
const bubblesort = require('bubble-sort-js');

// Mongoose Error Handling
function hasErrors(err) {
  if (err) {
    console.log(err);
    let modelErrors = [];
    switch (err.code) {
      case 11000: {}
      case 11001: {
        modelErrors.push({
          msg: 'Slug already used',
          param: 'slug'
        });
        break;
      }
      default: {
        if (err.errors) {
          for (var x in err.errors) {
            modelErrors.push({
              param: x,
              msg: err.errors[x].message,
              value: err.errors[x].value
            });
          }
        }
      }
    }
    return modelErrors;
  }

  return null;
}

// Validations
function validateUniqueSlug(value, callback) {
  const Gallery = mongoose.model('Gallery');
  Gallery.find({
    $and: [{
      slug: value
    }, {
      _id: {
        $ne: this._id
      }
    }]
  }, function(err, gallery) {
    callback(err || gallery.length === 0);
  });
};

// Getter
function escapeProperty(value) {
  return _.escape(value);
};

// ImageSchema
const ImageSchema = new Schema({
  ref: {
    type: String,
    required: true
  },
  order: {
    type: Integer,
    required: true,
  }
});

// GallerySchema
const GallerySchema = new Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    // TODO: match valid slug chars
    validate: [validateUniqueSlug, 'Slug is already in-use']
  },
  title: {
    type: String,
    required: true,
    get: escapeProperty
  },
  private: {
    type: Boolean,
    required: true,
    default: false
  },
  _images: {
    type: [ImageSchema],
    required: true,
    default: []
  },
});

// Pre-save hook
GallerySchema.pre('save', function(next) {
  next();
});

// Static Methods
GallerySchema.statics = {
  /**
   * CountGalleries - return the number of galleries
   *
   * @return {Object}
   * @api public
   */
  countGalleries: function() {
    const Gallery = mongoose.model('Gallery');
    const defer = Q.defer();
    Gallery.count({}, function(err, nGalleries) {
      if (err) return defer.reject(err);
      return defer.resolve(nGalleries);
    });
    return defer.promise;
  },

  /**
   * GetGalleries - return the list of galleries
   *
   * @param {Integer} skip
   * @param {Integer} limit
   * @return {Object}
   * @api public
   */
  getGalleries: function(skip, limit) {
    const Gallery = mongoose.model('Gallery');
    const options = skip && limit ? {skip: skip, limit: limit} : {};
    const defer = Q.defer();
    Gallery.find({}, {}, options, function(err, galleries) {
      if (err) return defer.reject(err);
      return defer.resolve(galleries);
    });
    return defer.promise;
  },

  /**
   * GetGalleryById - return the gallery matching the id
   *
   * @param {String} id
   * @return {Object}
   * @api public
   */
  getGalleryById: function(id) {
    if(!id) throw new Error('Gallery.getGalleryById: id parameter is mandatory');
    const Gallery = mongoose.model('Gallery');
    const defer = Q.defer();
    Gallery.findOne({_id: id}, function(err, gallery) {
      if (err) return defer.reject(err);
      return defer.resolve(gallery);
    });
    return defer.promise;
  },

  /**
   * EditGalleryById - edit the gallery matching the id
   *
   * @param {String} id
   * @return {Object}
   * @api public
   */
  editGalleryById: function(id, galleryParams) {

    if(!id) throw new Error('Gallery.editGalleryById: id parameter is mandatory');
    const Gallery = mongoose.model('Gallery');
    const defer = Q.defer();

    function save(gallery) {

      Object.keys(galleryParams).forEach(function (key, index) {
        if(key==='_images') return; // handle this in a dedicated function
        gallery[key] = galleryParams[key];
      });

      gallery.save(function(err) {
        const errors = hasErrors(err);
        if(errors) return defer.reject(errors);
        defer.resolve(gallery);
      });
    }

    Gallery.getGalleryById(id)
      .then(save)
      .catch(defer.reject);

    return defer.promise;
  },

  /**
   * EditGalleryById - edit the gallery matching the id
   *
   * @param {String} id
   * @return {Object}
   * @api public
   */
  addGalleryImageByGalleryId: function(id, galleryParams) {

    if(!id) throw new Error('Gallery.editGalleryById: id parameter is mandatory');
    const Gallery = mongoose.model('Gallery');
    const defer = Q.defer();

    function save(gallery) {

      Object.keys(galleryParams).forEach(function (key, index) {
        if(key==='_images') return; // handle this in a dedicated function
        gallery[key] = galleryParams[key];
      });

      gallery.save(function(err) {
        const errors = hasErrors(err);
        if(errors) return defer.reject(errors);
        defer.resolve(gallery);
      });
    }

    Gallery.getGalleryById(id)
      .then(save)
      .catch(defer.reject);

    return defer.promise;
  },

  /**
   * DeleteGalleryById - delete the gallery matching the id
   *
   * @param {String} id
   * @return {Object}
   * @api public
   */
  deleteGalleryById: function(id) {
    if(!id) throw new Error('Gallery.deleteGalleryById: id parameter is mandatory');
    const Gallery = mongoose.model('Gallery');
    const defer = Q.defer();
    Gallery.remove({_id: id}, function(err, result) {
      if (err) return defer.reject(err);
      return defer.resolve(result);
    });
    return defer.promise;
  },

  createGallery: function(galleryParams) {
    const Gallery = mongoose.model('Gallery');
    const gallery = new Gallery(galleryParams);

    const defer = Q.defer();
    gallery.save(function(err) {
      const errors = hasErrors(err);
      if(errors) return defer.reject(errors);
      defer.resolve(gallery);
    });

    return defer.promise;
  }
}

// Instance Methods
GallerySchema.methods = {

  /**
   * LoadImages - loadImages from _images
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  loadImages: function(role) {
    const GalleryImage = mongoose.model('GalleryImage');
    const defer = Q.defer();
    const orders = [];

    // Order images
    bubblesort(this._images, function(a, b) { return a.order - b.order; });

    async.map(this._images, function(_image, cb) {
      orders.push(_image.order);
      GalleryImage.getImageById(_image.ref)
        .then(function(image) {
          cb(null, image);
        })
        .catch(cb); // cb(err)
    }, function(err, images) {
      if(err) return defer.reject(err);
      defer.resolve(images)
    });
    return defer.promise;
  },

  /**
   * Hide security sensitive fields
   *
   * @returns {*|Array|Binary|Object}
   */
  toJSON: function() {
    return this.toObject();;
  }
};

mongoose.model('Gallery', GallerySchema);
