var express = require('express')
  , everyauth = require('everyauth')
  ;

var app = express.createServer();
app.configure(function() {
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: process.env.SESSION_SECRET
  }));
  app.use(everyauth.middleware());
  app.use(express['static'](__dirname + "/../public"));
});
everyauth.helpExpress(app);

app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.start = function(port) {
  app.listen(port, function() {
    console.log("HUD up on", port);
  });
};

module.exports = app;
