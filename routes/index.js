
/**
 * Module dependencies.
 */

var path = require('path')
  , Take = require('../models').Take; 

/*
 * GET /
 */

exports.index = function(req, res) {
  Take.find({}, function(err, takes) {
    if (err) console.log(err);

    takes.forEach(function(take) {
      take.picture = './uploads/' + take.picture;
    });
    res.render('index', { takes: takes });
  });
};

/*
 * POST /upload
 */

exports.upload = function(req, res) {
  var body     = req.body
    , pathname = req.files.file.path
    , filename = path.basename(pathname);

  Take.create({
    latitude:  body.latitude,
    longitude: body.longitude,
    picture:   filename
  },

  function(err) {
    if (err) console.log(err);
    res.redirect('back');
  });
}