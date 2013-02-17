
/**
 * Module dependencies.
 */

var pkg = require('./package')
  , morph = require('morph')
  , express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , sio = require('socket.io')
  , ClientHandler = require('./lib/clienthandler');

var app = module.exports = express()
  , server = http.createServer(app)
  , io = sio.listen(server)
  , clientHandler = new ClientHandler(app, io);
  
var uploadDir = __dirname + '/public/photos';

if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser({ uploadDir: uploadDir } ));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.locals.title = morph.toTitle(pkg.name);

app.get('/', routes.index);

app.post('/photos', routes.photos);

io
  .of('/uplook')
  .on('connection', function(socket) {

    socket.on('hello', function(message) {
      clientHandler.addClient(socket, message);
    });

    socket.on('battery', function(message) {
      clientHandler.updateBattery(socket, message);
    });

    socket.on('disconnect', function() {
      clientHandler.removeClient(socket);
    });
  });

io
  .of('/overlook')
  .on('connection', function(socket) {
    var Camera = require('./models').Camera;

    Camera
    .find({})
    .populate('photos')
    .exec(function(err, cameras) {
      socket.emit('init', cameras);
    });

    socket.on('viewpoint', function(message) {
      socket.broadcast.emit('viewpoint', message);
      // manager.viewpoint(message); // socket.emit('viewpoint', message);
    });

    socket.on('take', function(message) {
      console.log(message);
      // manager.take(message); // socket.emit('take');
    });
  });

if (!module.parent) {
  server.listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
  });
}