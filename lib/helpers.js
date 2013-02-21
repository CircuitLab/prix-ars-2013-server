
/**
 * Module dependencies.
 */

var path = require('path');

/**
 * Join photo path and given filename.
 *
 * @param {String} filename
 * @return {String}
 */

exports.photoPath = function(filename) {
  return path.normalize(path.join(__dirname + '/../public/photos/', filename));
};