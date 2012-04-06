var auth   = require('./app/auth') // Must be configured before the server
  , app    = require('./app/server')
  , routes = require('./app/routes')
  ;

app.start(process.env.PORT || 4483);
