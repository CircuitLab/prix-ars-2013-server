
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
  device:    { type: Schema.Types.ObjectId, ref: 'Device' },
  created:   { type: Date, default: Date.now, index: true }
});