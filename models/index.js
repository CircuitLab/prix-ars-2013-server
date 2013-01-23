
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , fs = require('fs')
  , path = require('path')
  , morph = require('morph')
  , dir = path.join(__dirname, '/schema')
  , config = require('../config').mongodb;

/**
 * Expose mongoose.
 */

exports.mongoose = mongoose;

/**
 * Set debug flag.
 */

mongoose.set('debug', 'production' !== process.env.NODE_ENV);

/**
 * Expose mongoose connection.
 */

var db = exports.db = mongoose.createConnection(config.host, config.database);

/**
 * Expose models.
 */

fs.readdirSync(dir).forEach(function(filename) {
  if (!/\.js/.test(filename)) return;
  var name = morph.toUpperCamel(path.basename(filename, '.js'));
  exports[name] = db.model(name, require(path.join(dir, filename)));
});
