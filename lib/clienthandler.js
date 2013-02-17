
/**
 * Module dependencies.
 */

var Eye = require('../models').Eye;

function ClientHandler(app, io) {
  this.clients = {};

  this.app = app;
  this.io = io;
}

ClientHandler.prototype.addClient = function(socket, message) {
  var udid = message.udid
    , latitude = message.latitude
    , longtitude = message.longtitude;

  Eye.findOrInitializeByUdid(udid, function(err, eye) {
    if (err) return; // TODO: handle error.

    eye.latitude = latitude;
    eye.longtitude = longtitude;

    eye.save(function(err) {
      clients[socket.id] = { socketId: socket.id, udid: udid };
    });
  });
}

ClientHandler.prototype.updateBattery = function(socket, message) {
  var bettery = message.battery
    , udid = clients[socket.id];

  if (udid) {
    Eye.findByUdid(udid, function(err, eye) {
      eye.battery = battery;

      eye.save(function(err) {
        console.log('Yeah!');
      });
    });
  }
}

ClientHandler.prototype.removeClient = function(socket) {
  delete clients[socket.id];
}

module.exports = ClientHandler