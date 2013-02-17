#!/usr/bin/env node

var models = require('../models')
  , Camera = models.Camera
  , Photo = models.Photo
  , cameras = require('../config/cameras.json');

Camera.find({}).remove({}, function(){});
Photo.find({}).remove({}, function(){});

cameras.forEach(function(camera) {

  var c = new Camera(camera);
  
  var photos = [
    "4452680.png",
    "4664968.png"
  ];

  photos.forEach(function(photo) {
    var p = new Photo({ file: photo });

    c.photos.push(p._id);
    p.save();
  });
  
  c.save();
});
