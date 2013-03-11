
/**
 * Module dependencies.
 */

var Schema = require('mongoose').Schema
  , config = require('../../config').server;

/**
 * Photo schema definition.
 */

var Photo = module.exports = new Schema({
  url:       String,
  file:      String,
  binary:    Buffer,
  timestamp: Number,
  latitude:  Number,
  longitude: Number,
  compass:   Number,
  angle:     Number,
  camera:    { type: Schema.Types.ObjectId, ref: 'Camera' },
  created:   { type: Date, default: Date.now, index: true }
});

Photo.post('init', function(doc) {
  if (doc.file.length > 0) {
    doc.url = config.photoPath + doc.file;
    doc.file = './photos/' + doc.file;

    console.log(doc);
  }
});