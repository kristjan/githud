var everyauth = require('everyauth');

everyauth.debug = true;
everyauth.github
  .scope('repo')
  .appId(process.env.GITHUB_APP_ID)
  .appSecret(process.env.GITHUB_APP_SECRET)
  .findOrCreateUser(function(session, accessToken, accessTokenExtra, githubUserMetaData) {
    session.githubToken = accessToken;
    return session.githubUser = githubUserMetaData;
  })
  .redirectPath('/')
  ;
