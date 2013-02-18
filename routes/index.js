
/**
 * Module dependencies.
 */

var path = require('path')
  , fs = require('fs')
  , base64id = require('base64id')
  , Photo = require('../models').Photo; 

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
  var body     = req.body
    , filename = Date.now() + '-' + base64id.generateId() + '.png'
    , filepath = '../public/photos/' + filename
    , image    = new Buffer(body.photo, 'base64');

  fs.writeFile(filepath, image, function(err) {
    Photo.create({
      file:      filename,
      x:         body.x,
      y:         body.y,
      timestamp: body.timestamp,
      battery:   body.battery
    },

    function(err) {
      if (err) console.log(err);
    });
  });

  // res.header({
  //   'Content-Type':'application/json',
  //   'cache-control':'no-cache'
  // });

  // res.json(200, { status: 'OK' });

  Photo.create({ file: filename }, function(err, photo) {
    console.log(err, photo);
  });

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
  res.json(200, { status: 'OK' });
}