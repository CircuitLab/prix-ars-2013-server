
/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , base64id = require('base64id')
  , models = require('../models')
  , Camera = models.Camera
  , Photo = models.Photo
  , helper = require('../lib/helpers')
  , photoPath = helper.photoPath; 

/*
 * GET /
 */

exports.index = function(req, res) {
  res.render('index');
};

/*
 * POST /photos
 */

exports.photos = function(req, res) {
  var body = req.body
    , udid = body.udid
    , filename = Date.now() + '-' + base64id.generateId() + '.png'
    , filepath = photoPath(filename)
    , image    = new Buffer(body.photo, 'base64');

  fs.writeFile(filepath, image, function(err) {
    if (err) return console.log(err); // TODO: handle error.

    Camera.findByUdid(udid, function(err, camera) {
      if (err) return console.log(err); // TODO: handle error.

      Photo.create({ file: filename }, function(err, photo) {
        if (err) return console.log(err); // TODO: handle error.

        camera.photos.push(photo._id);

        camera.save(function() {
          res.json(200, { status: 'OK' });
          req.app.emit('app:photos', camera);
        });
      });
    });
  });

  // res.header({
  //   'Content-Type':'application/json',
  //   'cache-control':'no-cache'
  // });

  // res.json(200, { status: 'OK' });

  // Photo.create({ file: filename }, function(err, photo) {
  //   console.log(err, photo);
  // });

  // Photo.create({
  //   file:      filename,
  //   binary:    body.photo,
  //   x:         body.x,
  //   y:         body.y,
  //   timestamp: body.timestamp,
  //   battery:   body.battery
  // },

  // function(err) {
  //   if (err) console.log(err);
  //   res.redirect('back');
  // });
}