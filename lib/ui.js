
/**
 * Module dependencies.
 */

var dgram = require('dgram')
  , osc = require('osc-min')
  , EventEmitter = require('events').EventEmitter
  , Camera = require('../models').Camera;

function UI() {
  var self = this;

  this.clients = {};

  this.keys = {
    'hello':     ['port'],
    'viewpoint': ['udid', 'compass', 'angle'],
    'take':      ['udid']
  }

  this.sock = dgram.createSocket('udp4');
  this.sock.bind(50001);

  this.sock.on('listening', function() {
    var address = this.address();
    console.log("osc server listening " + address.address + ":" + address.port);
  });

  this.sock.on('message', function(msg, remote) {
    var msg = osc.fromBuffer(msg);
    console.log("server got: " + msg + " from " + remote.address + ":" + remote.port);

    var address = msg['address'].replace('/gianteyes/', '') // msg.elements[0]['address'].replace('/gianteyes/', '')
      , args = msg['args'] // msg.elements[0]['args']
      , keys = self.keys[address]
      , data = remote;

    console.log(address, args);
    // self.response(address, remote);

    if (typeof keys === 'undefined') return;
    keys.forEach(function(key, i) {
      if (undefined !== args[i]) data[key] = args[i]['value'];
    });

    self.emit(address, data);
  });
}

UI.prototype.__proto__ = EventEmitter.prototype;

UI.prototype.addClient = function(message) {
  var self = this
    , ip = message.address
    , port = message.port
    , data;

  self.clients[ip] = port;
  
  Camera
    .find({})
    .populate('photos')
    .exec(function(err, docs) {
      var cameras = [];

      docs.forEach(function(doc) {
        cameras.push(doc.toApiResponse());
      });

      console.log('cameras', cameras);
      self.send('cameras', { cameras: cameras });
    });
}

UI.prototype.send = function(address, msg) {
  if (typeof msg === 'undefined') return;

  var self = this
    , clients = self.clients
    , ips = Object.keys(clients)
    , address = '/gianteyes/' + address
    , data = JSON.stringify(msg)
    , buf
    , len;

  buf = osc.toBuffer({ address: address, args: [data] });
  len = buf.length;

  ips.forEach(function(ip) {
    console.log(address + ' send osc message to ' + ip + ':' + clients[ip]);
    self.sock.send(buf, 0, len, clients[ip], ip);
  });
}

UI.prototype.response = function(address, remote) {
  var self = this
    , msg = { status: 'OK' }
    , data = JSON.stringify(msg)
    , address = '/gianteyes/' + address
    , buf = osc.toBuffer({ address: address, args: [data] })
    , len = buf.length;

  self.sock.send(buf, 0, len, remote.port, remote.address);
}

module.exports = UI;

// var ui = new UI();

// ui.on('hello', function(message) {
//   console.log('ui.js:hello!', message);
// });

// ui.on('viewpoint', function(message) {
//   console.log(message);
// });

// ui.on('take', function(message) {
//   console.log(message);
// });
