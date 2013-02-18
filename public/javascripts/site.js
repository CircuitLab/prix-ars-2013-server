
$.fn.serializeObject = function() {
  var ary = $(this).serializeArray()
    , obj = {};

  _.map(ary, function(el) {
    obj[el.name] = el.value;
  });

  return obj;
}

/**
 * Constructs a new Overlook.
 */

function Overlook(socket, photoView, opts) {
  this.socket = socket;
  this.photoView = photoView;

  this.cameras = {};

  this.map = new google.maps.Map(document.getElementById('map'), opts);
}

Overlook.prototype.createCamera = function(camera) {
  var camera = new Camera(this, camera);

  this.cameras[camera.udid] = camera;
  return camera;
}

Overlook.prototype.closeInfo = function() {
  _.map(this.cameras, function(camera) {
    camera.closeInfo();
  });
}

Overlook.prototype.updateVp = function(d) {
  this.socket.emit('viewpoint', { udid: d.udid, x: d.x, y: d.y });
}

Overlook.prototype.renderVp = function(d) {
  var camera = this.cameras[d.udid];

  if (camera) camera.renderVp(d);
}

Overlook.prototype.takePhoto = function(udid) {
  this.socket.emit('take', { udid: udid });
}

/**
 * Constructs a new Camera.
 */

function Camera(overlook, opts) {
  this.overlook = overlook;
  this.map = overlook.map;
  this.photoView = overlook.photoView;

  this.udid = opts.udid;
  this.lat = opts.latitude;
  this.lng = opts.longtitude;
  this.x = opts.x;
  this.y = opts.y;

  this.photos = opts.photos;

  this.marker = new google.maps.Marker({
    position: new google.maps.LatLng(this.lat, this.lng),
    map: this.map,
    animation: google.maps.Animation.DROP,
    title: this.udid
  });

  this.el = '#' + this.udid;

  this.template = _.template($('#infowindow').html());
  this.content = this.template({
    udid: this.udid,
    lat:  this.lat,
    lng:  this.lng,
    x:    this.x,
    y:    this.y
  });

  this.infowindow = new google.maps.InfoWindow({ content: this.content });
}

Camera.prototype.openInfo = function() {
  this.overlook.closeInfo();
  this.infowindow.open(this.map, this.marker);

  this.addPhotos();
}

Camera.prototype.closeInfo = function() {
  this.infowindow.close();
}

Camera.prototype.renderVp = function(d) {
  $el = $(this.el);

  $el.find('.viewpoint-x').val(d.x);
  $el.find('.viewpoint-y').val(d.y);
}

Camera.prototype.addPhotos = function() {
  this.photoView.removePhotos();
  this.photoView.addPhotos(this.photos);
}

/**
 * Constructs a new PhotoView.
 */

function PhotoView(panel) {
  this.panel = $(panel);
  this.el = '#photos';
  this.template = _.template($(this.el).html());

  this.panel.html(this.template());
}

PhotoView.prototype.addPhotos = function(photos) {
  var self = this;
  _.map(photos, function(photo) {
    self.appendPhoto(photo);
  });
}

PhotoView.prototype.removePhotos = function(photo) {
  $(this.el).children().remove();
}

PhotoView.prototype.appendPhoto = function(photo) {
  var tmpl = _.template($('#photo').html());

  $(this.el).append(tmpl({ src: photo.file }));
}

$(function() {

  var mapType = google.maps.MapTypeId.SATELLITE
    , zoom = 13
    , center = new google.maps.LatLng(35.36, 138.75);

  var socket = new io.connect('/overlook')
    , photoView = new PhotoView('#panel');
  
  var overlook = new Overlook(socket, photoView, {
    zoom: 13,
    mapTypeId: mapType,
    center: center
  });

  socket.on('init', function(cameras) {
    _.map(cameras, function(camera) {
      var c = overlook.createCamera(camera);
      google.maps.event.addListener(c.marker, 'click', function() {
        c.openInfo();
      });
    });
  });

  socket.on('viewpoint', function(message) {
    overlook.renderVp(message);
  });

  socket.on('hello', function(camera) {
    var c = overlook.createCamera(camera);
    google.maps.event.addListener(c.marker, 'click', function() {
      c.openInfo();
    });
  });

  $(document).on('submit', '.viewpoint', function() {
    overlook.updateVp($(this).serializeObject());
    return false;
  });

  $(document).on('click', '.take', function() {
    overlook.takePhoto($(this).val());
    return false;
  });

  window.socket = socket;
  window.overlook = overlook;

});
