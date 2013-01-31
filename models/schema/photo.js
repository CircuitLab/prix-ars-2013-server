
/**
 * Module dependencies.
 */

var Schema = require('mongoose').Schema;

/**
 * Photo schema definition.
 */

var Photo = module.exports = new Schema({
  photo:     String,
  timestamp: Number,
  x:         Number,
  y:         Number,
  battery:   Number,
  created:   { type: Date, default: Date.now, index: true }
});