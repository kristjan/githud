if (typeof GitHUD === 'undefined') GitHUD = {};

GitHUD.REPO_HANDLE_EX = /\w+\/\w+/;

GitHUD.Core = (function() {
  function init() {
    GitHUD.githubToken = $.cookie('githubToken');
    $(window).resize(resizeUI);
    if (GitHUD.githubToken) {
      initRepos();
      GitHUD.Nav.init(GitHUD.repos);
      GitHUD.Kanban.init(GitHUD.repos);
    } else {
      $('#content').html(new GitHUD.LoginPrompt({}).render().el);
    }
  }

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

  function loadStages(labels, models) {
    var flow = _.chain(models)
      .filter(function(model) {
        return model.name.match(/^\d+ - .+/);
      }).sortBy(function(model) {
        return model.name;
      }).value();

    _.each(flow, function(step) {
      printLabel(labels.get(step.name));
    });
    resizeStages();
  }

  function printLabel(label) {
    var view = new GitHUD.StageView({ model: label });
    $('#content').append(view.el);
  }

  function resizeContent() {
    var content = $('#content');
    content.height($('body').height() - content.offset().top - 20);
  }

  var STAGE_MARGIN = 5;
  function resizeStages() {
    var content = $('#content');
    var stages = $('.stage', content);
    var spacing = STAGE_MARGIN * (stages.length - 1);
    var width = content.width() - spacing;
    stages.css({ width: Math.floor(width / (stages.length)) });
    stages.not(':last-child').css({ 'margin-right' : STAGE_MARGIN });
    stages.each(function(i, stage) {
      stage = $(stage);
      var list = $('ul', stage);
      $('ul', stage).height(stage.height() - list.position().top);
    });
  }

  function resizeUI() {
    resizeContent();
    resizeStages();
  }

  return {
    init  : init
  };
})();

$(GitHUD.Core.init);
