var app = require('./server');

app.all('*', function(req, res, next) {
  if (req.session.auth && req.session.auth.github) {
    res.cookie('githubToken', req.session.auth.github.accessToken);
  }
  next();
});

app.get('/', function(req, res) {
  res.render('index.ejs');
});
