if (typeof GitHUD === 'undefined') GitHUD = {};

GitHUD.Kanban = (function() {
  var stageViews = _([]);

  function init(repos) {
    GitHUD.repos.on('add', loadRepo);
    if (GitHUD.githubToken && repos.size() > 0) loadRepos(repos);
  }

  function loadRepos(repos) {
    if (!GitHUD.labels || GitHUD.labels.size() === 0) {
      loadLabels(repos, buildStages);
    } else {
      buildStages(repos);
    }
  }

  function loadRepo(repo) {
    loadRepos(new GitHUD.Repos([repo]));
  }

  function loadLabels(repos, done) {
    // Assume the first repo has all the labels for now
    repos.first().labels().fetch({
      success: function(labels, models) {
        GitHUD.labels = flowLabels(labels);
        done(repos);
      }
    });
  }

  function flowLabels(labels) {
    return new GitHUD.Labels(labels.chain()
      .filter(function(label) {
        return label.get('name').match(/^\d+ - .+/);
      }).sortBy(function(label) {
        return parseInt(label.get('name'), 10);
      }).value());
  }

  function buildStages(repos) {
    async.parallel(generateIssueFetchers(repos), function(err, results) {
      GitHUD.labels.each(buildStage);
      GitHUD.Util.resizeUI();
    });
  }

  function buildStage(label) {
    var stage;
    stage = stageViews.find(function(stage) {
      return stage.model.get('name') === label.get('name');
    });
    if (!stage) {
      stage = new GitHUD.StageView({ model: label });
      stageViews.push(stage);
      $('#content').append(stage.render().el);
    }
  }

  function generateIssueFetchers(repos) {
    return repos.map(function(repo) {
      return generateIssueFetcher(repo);
    });
  }

  function generateIssueFetcher(repo) {
    return function(done) {
      repo.addIssuesToLabels(GitHUD.labels, done);
    };
  }

  return {
    init : init
  };
})();

