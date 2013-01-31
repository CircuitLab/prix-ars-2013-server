
/**
 * Module dependencies.
 */

var pkg = require('./package')
  , morph = require('morph')
  , express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = module.exports = express();

if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({ uploadDir: __dirname + '/public/photos'} ));
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

app.locals.title = morph.toTitle(pkg.name);

app.get('/', routes.index);
app.post('/photos', routes.photos);

if (!module.parent) {
  http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
  });
}