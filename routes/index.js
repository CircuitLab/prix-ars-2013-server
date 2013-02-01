
/**
 * Module dependencies.
 */

var path = require('path')
  , Photo = require('../models').Photo; 

/*
 * GET /
 */

exports.index = function(req, res) {
  console.log('index');
  Photo.find({}, function(err, photos) {
    if (err) console.log(err);

    photos.forEach(function(photo) {
      photo.file = './photos/' + photo.file;
    });

    res.render('index', { photos: photos });
  });
};

/*
 * POST /photos
 */

exports.photos = function(req, res) {
  console.log('photos');
  var body     = req.body
    , pathname = req.files.file.path
    , filename = path.basename(pathname);

  console.log(body);

  res.json(200, { status: 'OK' });
  
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
  // res.end(200);
}