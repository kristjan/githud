if (typeof GitHUD === 'undefined') GitHUD = {};

GitHUD.Nav = (function() {
  function init(repos) {
    var repoNav = new GitHUD.RepoNavList({ collection: repos });
    $('#nav').append(repoNav.render().el);
  }

  return {
    init : init
  };
})();
