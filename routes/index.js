
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index');
};

/*
 * POST upload image.
 */

exports.upload = function(req, res) {
  res.redirect('back');
}