
/**
 * Module dependencies.
 */

var Schema = require('mongoose').Schema;

/**
 * Camera schema definition.
 */

var Camera = module.exports = new Schema({
  udid:       String,
  latitude:   Number,
  longtitude: Number,
  battery:    Number,
  compass:    Number,
  angle:      Number,
  living:     { type: Boolean, default: false },
  operable:   Boolean,
  photos:     [{ type: Schema.Types.ObjectId, ref: 'Photo' }],
  created:    { type: Date, default: Date.now, index: true }
});

Camera.statics.findAll = function(udid, callback) {
  this.populate();
}

Camera.statics.findByUdid = function(udid, callback) {
  this
    .findOne({ udid: udid })
    .populate('photos')
    .exec(function(err, doc) {
      callback(err, doc);
    });
}

Camera.statics.findOrInitializeByUdid = function(udid, callback) {
  var self = this;

  self.findByUdid(udid, function(err, doc) {
    if (doc) {
      callback(err, doc);
    } else {
      callback(err, new self({ udid: udid }));
    }
  });
}

Camera.statics.killByUdid = function(udid, callback) {
  var self = this;

  self.findByUdid(udid, function(err, doc) {
    if (err) return callback(err);
    if (!doc) return callback(null);

    doc.living = false;
    doc.save(function(err) {
      return callback(err);
    });
  });
}

Camera.methods.toApiResponse = function() {
  var self = this
    , photos = [];

  self.photos.forEach(function(photo) {
    photos.push(photo.toApiResponse());
  });

  return {
    udid: self.udid,
    latitude: self.latitude,
    longitude: self.longitude,
    compass: self.compass,
    angle: self.angle,
    battery: self.battery,
    operable: self.operable,
    living: self.living,
    photos: photos
  }
}