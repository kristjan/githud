var everyauth = require('everyauth');

everyauth.debug = true;
everyauth.github
  .scope('repo')
  .appId(process.env.GITHUB_APP_ID)
  .appSecret(process.env.GITHUB_APP_SECRET)
  .findOrCreateUser(function(session, accessToken, extra, githubUser) {
    return session.githubUser = githubUser;
  })
  .redirectPath('/')
  .handleLogout(function (req, res) {
    res.cookie('githubToken', '', {maxAge: -1000}); // Expire immediately
    req.logout();
    this.redirect(res, this.logoutRedirectPath());
  })
  ;
