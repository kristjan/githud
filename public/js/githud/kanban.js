if (typeof GitHUD === 'undefined') GitHUD = {};

GitHUD.Kanban = (function() {
  function init(repos) {
    if (!GitHUD.githubToken || repos.size() === 0) return;
    loadLabels(repos, buildStages);
  }

  function loadLabels(repos, done) {
    // Assume the first repo has all the labels for now
    repos.first().labels().fetch({
      success: function(labels, models) {
        GitHUD.labels = flowLabels(labels);
        done();
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

  function buildStages() {
    async.parallel(generateIssueFetchers(), function(err, results) {
      GitHUD.labels.each(buildStage);
      GitHUD.Util.resizeUI();
    });
  }

  function buildStage(label) {
    var stage = new GitHUD.StageView({ model: label });
    $('#content').append(stage.render().el);
  }

  function generateIssueFetchers() {
    return GitHUD.repos.map(function(repo) {
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

