
$.fn.serializeObject = function() {
  var ary = $(this).serializeArray()
    , obj = {};

  _.map(ary, function(el) {
    obj[el.name] = el.value;
  });

  return obj;
}

window.infowindows = [];

/**
 * Constructs a new Overlook.
 */

function Overlook(socket, photoView, opts) {
  this.cameras = {};

  this.socket = socket;
  this.photoView = photoView;
  this.map = new google.maps.Map($('#map').get(0), opts);

  this.aliveIcon = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png';
  this.deadIcon = 'http://chart.apis.google.com/chart?'
                + 'chst=d_map_xpin_icon&'
                + 'chld=pin|glyphish_skull|909090|FF0000';
}

Overlook.prototype.createCamera = function(camera) {
  var camera = new Camera(this, camera);

  this.cameras[camera.udid] = camera;
  google.maps.event.addListener(camera.marker, 'click', function() {
    camera.openInfo();
  });

  return camera;
}

Overlook.prototype.findCamera = function(udid) {
  return this.cameras[udid];
}

Overlook.prototype.createOrReviveCamera = function(camera) {
  var ca = this.findCamera(camera.udid);

  if (ca) {
    ca.revive();
  } else {
    this.createCamera(camera);
  }
}

Overlook.prototype.killCamera = function(udid) {
  var camera = this.findCamera(udid);

  if (camera) {
    camera.die();
  }
}

Overlook.prototype.closeInfo = function() {
  _.map(this.cameras, function(camera) {
    camera.closeInfo();
  });
}

Overlook.prototype.updatePoint = function(d) {
  this.socket.emit('viewpoint', {
    udid: d.udid,
    compass: d.compass,
    angle: d.angle
  });
}

Overlook.prototype.addPhoto = function(d) {
  var camera = this.cameras[d.udid];

  if (camera) camera.addPhoto(d);
}

Overlook.prototype.renderStatus = function(d) {
  var camera = this.cameras[d.udid];

  if (camera) camera.renderStatus(d);
}

Overlook.prototype.renderPoint = function(d) {
  var camera = this.cameras[d.udid];

  if (camera) camera.renderPoint(d);
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
  this.photoView = overlook.photoView

  this.udid = opts.udid;
  this.bat = opts.battery;
  this.lat = opts.latitude;
  this.lng = opts.longtitude;
  this.com = opts.compass;
  this.ang = opts.angle;
  this.living = opts.living;

  this.photos = opts.photos;

  this.marker = new google.maps.Marker({
    position: new google.maps.LatLng(this.lat, this.lng),
    map: this.map,
    animation: google.maps.Animation.DROP,
    title: this.udid
  });

  if (!this.living) this.marker.setIcon(this.overlook.deadIcon);

  this.el = '#' + this.udid;

  this.template = _.template($('#infowindow').html());
  this.content = this.template({
    udid: this.udid,
    bat:  this.bat,
    lat:  this.lat,
    lng:  this.lng,
    com:  this.com,
    ang:  this.ang
  });

  this.infowindow = new google.maps.InfoWindow({ content: this.content });
  this.opened = false;
}

Camera.prototype.openInfo = function() {
  this.overlook.closeInfo();

  this.infowindow.open(this.map, this.marker);
  this.opened = true;

  this.addPhotos();
}

Camera.prototype.closeInfo = function() {
  this.infowindow.close();
  this.opened = false;
}

Camera.prototype.renderStatus = function(d) {
  $el = $(this.el);

  $el.find('.bat').html(d.battery);
  $el.find('.lat').html(d.latitude);
  $el.find('.lng').html(d.longtitude);

  $el.find('.viewpoint-compass').val(d.compass);
  $el.find('.viewpoint-angle').val(d.angle);
}

Camera.prototype.renderPoint = function(d) {
  $el = $(this.el);

  $el.find('.viewpoint-x').val(d.x);
  $el.find('.viewpoint-y').val(d.y);
}

Camera.prototype.addPhoto = function(d) {
  var photos = d.photos
    , lastIndex = photos.length - 1
    , photo = photos[lastIndex];

  this.photos.push(photo);
  if (this.opened) this.photoView.prependPhoto(photo);
}

Camera.prototype.addPhotos = function() {
  this.photoView
    .removePhotos()
    .addPhotos(this.photos);
}

Camera.prototype.die = function() {
  this.marker.setIcon(this.overlook.deadIcon);
}

Camera.prototype.revive = function() {
  this.marker.setIcon(this.overlook.aliveIcon);
}

/**
 * Constructs a new PhotoView.
 */

function PhotoView(panel) {
  // this.panel = $(panel);
  this.el = '#photos';
  this.template = _.template($(this.el).html());

  // this.panel.html(this.template());
}

PhotoView.prototype.addPhotos = function(photos) {
  var self = this;
  _.map(photos, function(photo) {
    self.prependPhoto(photo);
  });
}

PhotoView.prototype.removePhotos = function(photo) {
  $(this.el).children().remove();

  return this;
}

PhotoView.prototype.prependPhoto = function(photo) {
  var tmpl = _.template($('#photo').html());

  $(this.el).prepend(tmpl({ src: photo.file }));
}

$(function() {

  var FUJI = new google.maps.LatLng(35.36, 138.75)
    , TOKYO = new google.maps.LatLng(35.563411, 139.40502);

  var mapType = google.maps.MapTypeId.SATELLITE
    , zoom = 10;
    // , zoom = 13;

  var socket = new io.connect('/overlook')
    , photoView = new PhotoView('#panel');
  
  var overlook = new Overlook(socket, photoView, {
    zoom: zoom,
    mapTypeId: mapType,
    center: TOKYO
  });

  socket.on('init', function(cameras) {
    _.map(cameras, function(camera) {
      overlook.createCamera(camera);
    });
  });

  socket.on('hello', function(camera) {
    overlook.createOrReviveCamera(camera);
  });

  socket.on('photo', function(camera) {
    overlook.addPhoto(camera);
  });

  socket.on('status', function(camera) {
    overlook.renderStatus(camera);
  });

  socket.on('viewpoint', function(message) {
    overlook.renderPoint(message);
  });

  socket.on('goodbye', function(camera) {
    overlook.killCamera(camera.udid);
  });

  $(document).on('submit', '.viewpoint', function() {
    overlook.updatePoint($(this).serializeObject());
    return false;
  });

  $(document).on('click', '.take', function() {
    overlook.takePhoto($(this).val());
    return false;
  });

  window.socket = socket;
  window.overlook = overlook;

});
