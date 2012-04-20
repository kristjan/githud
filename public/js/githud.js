if (typeof GitHUD === 'undefined') GitHUD = {};

GitHUD.REPO_HANDLE_EX = /\w+\/\w+/;

GitHUD.Core = (function() {
  function init() {
    GitHUD.githubToken = $.cookie('githubToken');
    $(window).resize(GitHUD.Util.resizeUI);
    if (GitHUD.githubToken) {
      initRepos();
      GitHUD.Nav.init(GitHUD.repos);
      GitHUD.Kanban.init(GitHUD.repos);
    } else {
      $('#content').html(new GitHUD.LoginPrompt({}).render().el);
    }
    initAsteroids();
    initUserInfo();
  }

  var asteroids;
  function initAsteroids() {
    $('#home').click(function(evt) {
      evt.preventDefault();
      if (asteroids) return;
      asteroids = true;
      $('body').append($('<script>', {
        type: 'text/javascript',
        src: 'http://erkie.github.com/asteroids.min.js'
      }));
    });
  }

  function initUserInfo() {
    GitHUD.user = new GitHUD.User({
      token: GitHUD.githubToken
    });
    GitHUD.user.fetch({
      success: function() {
        new GitHUD.UserInfoView({
          el: '#user-info',
          model: GitHUD.user
        }).render();
      }
    });
  }

  /* --- Repository remembering --- */
  function initRepos() {
    GitHUD.repos = new GitHUD.Repos([]);
    loadRepos();
  }

  function addRepo(handle) {
    if (!GitHUD.REPO_HANDLE_EX.test(handle)) return;
    var present = GitHUD.repos.map(function(repo) {
      return repo.get('handle').toLowerCase();
    });
    if (!_.include(present, handle.toLowerCase())) {
      var repo = new GitHUD.Repo(handle);
      GitHUD.repos.add(repo);
    }
    saveRepos();
  }

  function removeRepo(repo) {
    GitHUD.repos.remove(repo);
    saveRepos();
    location.reload();
  }

  function loadRepos() {
    var repoHandles = JSON.parse(localStorage.getItem('repos') || '[]');
    _.each(repoHandles, function(handle) {
      GitHUD.repos.add(new GitHUD.Repo(handle));
      if (GitHUD.githubToken) GitHUD.repos.last().fetch();
    });
  }

  function saveRepos() {
    var repoHandles = GitHUD.repos.map(function(repo) {
      return repo.get('handle');
    });
    localStorage.setItem('repos', JSON.stringify(repoHandles));
  }

  return {
    init    : init,
    addRepo : addRepo,
    removeRepo : removeRepo
  };
})();

$(GitHUD.Core.init);
