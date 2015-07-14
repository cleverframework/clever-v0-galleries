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
    type: Number,
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
  comment: {
    type: String,
    default: '',
    get: escapeProperty
  },
  _images: {
    type: [ImageSchema],
    default: []
  }
});

// Virtuals
GallerySchema.virtual('image_preview').set(function(url) {
  throw new Error('Gallery::image_preview cannot be set.');
}).get(function() {
  if(this._images.length === 0) return false;
  return this._image_preview || false;
});

GallerySchema.virtual('n_images').set(function(url) {
  throw new Error('Gallery::n_images cannot be set.');
}).get(function() {
  return this._images.length
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
   * @param {Number} skip
   * @param {Number} limit
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
   * LoadImagePreview
   *
   * @return {Boolean|Object}
   * @api public
   */
  loadImagePreview: function() {
    const File = mongoose.model('File');
    const defer = Q.defer();
    const self = this;

    if(this._images.length === 0) {
      // Return false if no image into the gallery yet
      defer.resolve(false);
    } else {
      // Order images
      bubblesort(this._images, function(a, b) { return a.order - b.order; });

      File.getFileById(this._images[0].ref)
        .then(function(image) {
          self._image_preview = image.url;
          defer.resolve(image);
        })
        .catch(defer.reject);
    }

    return defer.promise;
  },

  /**
   * LoadImages - loadImages from _images
   *
   * @return {Array}
   * @api public
   */
  loadImages: function() {
    const File = mongoose.model('File');
    const defer = Q.defer();

    // Order images
    bubblesort(this._images, function(a, b) { return a.order - b.order; });

    async.map(this._images, function(_image, cb) {
      File.getImageById(_image.ref)
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
