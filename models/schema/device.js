
/**
 * Module dependencies.
 */

var Schema = require('mongoose').Schema;

/**
 * Device schema definition.
 */

var Device = module.exports = new Schema({
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