
/**
 * Module dependencies.
 */

var path = require('path')
  , Photo = require('../models').Photo; 

/*
 * GET /
 */

exports.index = function(req, res) {
  Photo.find({}, function(err, photos) {
    if (err) console.log(err);

    photos.forEach(function(photo) {
      photo.picture = './photos/' + photo.picture;
    });

    res.render('index', { photos: photos });
  });
};

/*
 * POST /photos
 */

exports.photos = function(req, res) {
  var body     = req.body
    , pathname = req.files.file.path
    , filename = path.basename(pathname);

  Photo.create({
    file: filename,
    
  },

  function(err) {
    if (err) console.log(err);
    res.redirect('back');
  });
}