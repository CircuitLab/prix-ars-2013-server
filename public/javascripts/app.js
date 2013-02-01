var socket = new io.connect("/");

socket.on('connect', function() {
  console.log('connect');
});

socket.emit('viewpoint', { x: 12, y: 34 });