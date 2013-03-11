
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