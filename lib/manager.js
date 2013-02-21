
/**
 * Module dependencies.
 */

var Camera = require('../models').Camera;

function Manager(app, io) {
  this.clients = {};
  this.overlookers = {};

  this.app = app;
  this.io = io;
}

Manager.prototype.addClient = function(socket, message) {
  var self = this
    , clients = self.clients
    , udid = message.udid
    , latitude = message.latitude
    , longtitude = message.longtitude;

  Camera.findOrInitializeByUdid(udid, function(err, camera) {
    if (err) return; // TODO: handle error.

    camera.latitude = latitude;
    camera.longtitude = longtitude;
    camera.living = true;

    camera.save(function(err) {
      clients[udid] = socket;

      self.io.of('/overlook').emit('hello', camera);
    });
  });
}

Manager.prototype.addPhoto = function(message) {
  var self = this
    , udid = message.udid;

  if (udid) {
    Camera.findByUdid(udid, function(err, camera) {
      if (udid) self.io.of('/overlook').emit('photo', camera);
    });
  }
}

Manager.prototype.updateStatus = function(message) {
  var self = this
    , udid = message.udid;

  if (udid) {
    Camera.findByUdid(udid, function(err, camera) {
      camera.battery = message.battery;
      camera.x = message.x;
      camera.y = message.y;
      camera.compass = message.compass;

      camera.save(function(err) {
        self.io.of('/overlook').emit('status', camera);
      });
    });
  }
}

Manager.prototype.removeClient = function(socket) {
  var self = this
    , clients = self.clients;

  for (var udid in clients) {
    if (clients.hasOwnProperty(udid) && clients[udid] == socket) {
      Camera.killByUdid(udid, function(err) {
        self
          .io
          .of('/overlook')
          .emit('goodbye', { udid: udid });

        delete self.clients[udid];
      });
    }
  }
}

Manager.prototype.addOverlooker = function(socket) {
  var overlookers = this.overlookers;

  Camera
    .find({})
    .populate('photos')
    .exec(function(err, cameras) {
      socket.emit('init', cameras);
      overlookers[socket.id] = socket;
    });
}

Manager.prototype.pointView = function(message) {
  var udid = message.udid
    , x = message.x
    , y = message.y
    , client = this.clients[udid];

  if (client) {
    client.emit('viewpoint', {
      x: x,
      y: y
    });
  }
}

Manager.prototype.takePhoto = function(message) {
  var udid = message.udid
    , client = this.clients[udid];
  
  if (client) {
    console.log('emitting "take" for client ' + udid);
    client.emit('take');
  }
}

module.exports = Manager