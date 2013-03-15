
/**
 * Module dependencies.
 */

var Camera = require('../models').Camera
  , Photo = require('../models').Photo;

function Manager(app, io, ui) {
  this.clients = {};
  this.overlookers = {};

  this.app = app;
  this.io = io
  this.ui = ui;
}

Manager.prototype.addClient = function(socket, message) {
  var self = this
    , clients = self.clients
    , udid = message.udid
    , latitude = message.latitude
    , longtitude = message.longtitude
    , operable = true;

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
      self.io.of('/overlook').emit('photo', camera);

      Photo
        .find({ camera: camera._id })
        .sort('-created')
        .exec(function(err, photos) {
          self.ui.send('photo', photos[0]);
        });
    });
  }
}

Manager.prototype.updateStatus = function(message) {
  var self = this
    , udid = message.udid;

  console.log('status', message);

  if (udid) {
    Camera.findByUdid(udid, function(err, camera) {
      camera.latitude = message.latitude || camera.latitude;
      camera.longtitude = message.longtitude || camera.longtitude;
      camera.compass = message.compass || camera.compass;
      camera.angle = message.angle || camera.angle;
      camera.battery = message.battery || camera.battery;

      camera.save(function(err) {
        self.io.of('/overlook').emit('status', camera);
        self.ui.send('camera', camera);
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
        self.io.of('/overlook').emit('goodbye', { udid: udid });

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

  // Camera.findAll(function(err, cameras) {
  //   socket.emit('init', cameras);
  //   overlookers[socket.id] = socket;
  // });
}

Manager.prototype.pointView = function(message) {
  var udid = message.udid
    , compass = message.compass
    , angle = message.angle
    , client = this.clients[udid];

  if (client) {
    console.log('emitting "viewpoint" for client ' + udid);
    client.emit('viewpoint', {
      compass: compass,
      angle: angle
    });
  }
}

Manager.prototype.takePhoto = function(message) {
  console.log('message', message);
  var udid = message.udid
    , client = this.clients[udid];
  
  if (client) {
    console.log('emitting "take" for client ' + udid);
    client.emit('take');
  }
}

module.exports = Manager;