var express = require('express')
  , everyauth = require('everyauth')
  , routes    = require('./routes')
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
  app.use(express.static(__dirname + "/../public"));
});

app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

everyauth.helpExpress(app);
routes.init(app);

var port = process.env.PORT || 4483;
app.listen(port, function() {
  console.log("HUD up on", port);
});
