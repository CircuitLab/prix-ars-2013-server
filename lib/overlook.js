
/**
 * Module dependencies.
 */

var Camera = require('../models').Camera;

function Overlook(socket) {
  var self = this;

  self.socket = socket;

  Camera
    .find({})
    .populate('photos')
    .exec(function(err, cameras) {
      self.socket.emit('init', cameras);
    });
}

module.exports = Overlook;
