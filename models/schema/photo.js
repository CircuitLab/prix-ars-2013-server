
/**
 * Module dependencies.
 */

var Schema = require('mongoose').Schema;

/**
 * Photo schema definition.
 */

var Photo = module.exports = new Schema({
  file:      String,
  binary:    Buffer,
  timestamp: Number,
  x:         Number,
  y:         Number,
  device:    { type: Schema.Types.ObjectId, ref: 'Camera' },
  created:   { type: Date, default: Date.now, index: true }
});

Photo.post('init', function(doc) {
  if (doc.file.length > 0) {
    doc.file = './photos/' + doc.file;
  }
});