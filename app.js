
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
  , Manager = require('./lib/manager');

var app = module.exports = express()
  , server = http.createServer(app)
  , io = sio.listen(server)
  , manager = new Manager(app, io);

/**
 * Configuration.
 */

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  // app.use(express.bodyParser({
  //   uploadDir: __dirname + '/public/photos',
  //   keepExtensions: true
  // }));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.locals.title = morph.toTitle(pkg.name);

if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

/**
 * Routes.
 */

app.get('/', routes.index);
app.post('/photos', routes.photos);

app.on('app:photos', function(photo) {
  manager.broadcast(photo);
});

io
  .of('/uplook')
  .on('connection', function(socket) {

    socket.on('hello', function(message) {
      manager.addClient(socket, message);
    });

    socket.on('battery', function(message) {
      manager.updateBattery(message);
    });

    socket.on('disconnect', function() {
      manager.removeClient(socket);
    });
  });

io
  .of('/overlook')
  .on('connection', function(socket) {
    manager.addOverlooker(socket);

    socket.on('viewpoint', function(message) {
      manager.pointView(message);
    });

    socket.on('take', function(message) {
      manager.takePhoto(message);
    });
  });

/**
 * Listen.
 */

if (!module.parent) {
  server.listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
  });
}