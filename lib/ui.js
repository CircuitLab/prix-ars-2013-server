
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
  this.sock.bind(7771, 'localhost');

  this.sock.on('message', function(msg, remote) {
    var msg = osc.fromBuffer(msg)
      , address = msg.elements[0].address.replace('/gianteyes/', '')
      , args = msg.elements[0].args
      , keys = self.keys[address]
      , data = remote;

    this.response(address, remote);

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
    .exec(function(err, cameras) {
      self.send('cameras', { data: cameras });
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

  console.log(address, msg);

  buf = osc.toBuffer({ address: address, args: [data] });
  len = buf.length;

  ips.forEach(function(ip) {
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
