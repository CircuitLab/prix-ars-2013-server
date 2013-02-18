
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

Overlook.prototype.updateVp = function(d) {
  this.socket.emit('viewpoint', { udid: d.udid, x: d.x, y: d.y });
}

Overlook.prototype.renderBattery = function(d) {
  var camera = this.cameras[d.udid];

  if (camera) camera.renderBattery(d);
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
  this.photoView = overlook.photoView

  this.udid = opts.udid;
  this.bat = opts.battery;
  this.lat = opts.latitude;
  this.lng = opts.longtitude;
  this.x = opts.x;
  this.y = opts.y;
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

Camera.prototype.renderBattery = function(d) {
  $el = $(this.el);

  $el.find('.battery').html(d.battery);
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

  var FUJI = new google.maps.LatLng(35.36, 138.75)
    , TOKYO = new google.maps.LatLng(35.663411, 139.70502);

  var mapType = google.maps.MapTypeId.SATELLITE
    // , zoom = 17;
    , zoom = 13;

  var socket = new io.connect('/overlook')
    , photoView = new PhotoView('#panel');
  
  var overlook = new Overlook(socket, photoView, {
    zoom: zoom,
    mapTypeId: mapType,
    center: FUJI
  });

  socket.on('init', function(cameras) {
    _.map(cameras, function(camera) {
      overlook.createCamera(camera);
    });
  });

  socket.on('hello', function(camera) {
    overlook.createOrReviveCamera(camera);
  });

  socket.on('battery', function(camera) {
    overlook.renderBattery(camera);
  });

  socket.on('viewpoint', function(message) {
    overlook.renderVp(message);
  });

  socket.on('goodbye', function(camera) {
    overlook.killCamera(camera.udid);
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
