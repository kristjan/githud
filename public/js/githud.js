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
  }

  /* --- Repository remembering --- */
  function initRepos() {
    GitHUD.repos = new GitHUD.Repos([]);
    loadRepos();
    GitHUD.repos.on('add', saveRepos);
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

  /* --- Issue loading --- */
  function printLabel(label) {
    var view = new GitHUD.StageView({ model: label });
    $('#content').append(view.el);
  }

  return {
    init  : init
  };
})();

$(GitHUD.Core.init);
