
/**
 * Module dependencies.
 */

var dgram = require('dgram')
  , osc = require('osc-min')
  , EventEmitter = require('events').EventEmitter;

function UI() {
  var self = this;

  this.clients = [];

  this.keys = {
    'hello':     ['IP', 'port'],
    'viewpoint': ['id', 'compass', 'angle'],
    'take':      ['id']
  }

  this.sock = dgram.createSocket('udp4');
  this.sock.bind(7771, 'localhost');

  this.sock.on('message', function(msg) {
    var msg = osc.fromBuffer(msg)
      , address = msg.address.replace('/gianteyes/', '')
      , args = msg.args
      , keys = self.keys[address]
      , data = {};

    keys.forEach(function(key, i) {
      data[key] = args[i]['value'];
    });

    self.emit(address, data);

    self.send('cameras', { aaa: 'bbb' });
  });
}

UI.prototype.__proto__ = EventEmitter.prototype;

UI.prototype.addClient = function(message) {
  var self = this
    , ip = message['IP']
    , port = message['Port']
    , data;

  self.client.push({ ip: ip, port: port });

  Camera
    .find({})
    .populate('photos')
    .exec(function(err, cameras) {
      console.log(cameras);
    });
}

UI.prototype.send = function(address, msg) {
  var self = this
    , address = '/gianteyes/' + address
    , data = JSON.stringify(msg)
    , buf
    , len;

  buf = osc.toBuffer({ address: address, args: [data] });
  len = buf.length;

  self.sock.send(buf, 0, len, 5000, 'localhost');
}

var ui = new UI();

ui.on('hello', function(message) {
  console.log('osc.js:hello!', message);
});

ui.on('viewpoint', function(message) {
  console.log(message);
});

ui.on('take', function(message) {
  console.log(message);
});
