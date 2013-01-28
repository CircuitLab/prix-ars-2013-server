
/**
 * Module dependencies.
 */

var Schema = require('mongoose').Schema;

/**
 * Take schema definition.
 */

var Take = module.exports = new Schema({
  picture:   String,
  latitude:  Number,
  longitude: Number,
  created:   { type: Date, default: Date.now, index: true }
});