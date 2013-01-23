
/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , env = require('../lib/env')
  , dir = path.join(__dirname, env)
  , config = {};

fs.readdirSync(dir).forEach(function(filename) {
  if (!/\.json/.test(filename)) return;
  var name = path.basename(filename, '.json');
  config[name] = require(path.join(dir, filename));
});

/**
 * Expose config.
 */

module.exports = config;