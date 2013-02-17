
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
  x:          Number,
  y:          Number,
  living:     Boolean,
  photos:     [{ type: Schema.Types.ObjectId, ref: 'Photo' }],
  created:    { type: Date, default: Date.now, index: true }
});

Camera.statics.findAll = function(udid, callback) {
  this.populate();
}

Camera.statics.findByUdid = function(udid, callback) {
  this.findOne({ udid: udid }, callback);
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