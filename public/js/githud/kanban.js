if (typeof GitHUD === 'undefined') GitHUD = {};

GitHUD.Kanban = (function() {
  var stageViews = _([]);

  function init(repos) {
    GitHUD.repos.on('add', loadRepo);
    if (GitHUD.githubToken && repos.size() > 0) loadRepos(repos);
  }

  function loadRepos(repos) {
    if (!GitHUD.labels || GitHUD.labels.size() === 0) {
      fetchLabels(repos, function(labels) {
        GitHUD.labels = flowLabels(labels);
        buildStages(GitHUD.labels, repos);
      });
    } else {
      buildStages(GitHUD.labels, repos);
    }
  }

  function loadRepo(repo) {
    loadRepos(new GitHUD.Repos([repo]));
  }

  function fetchLabels(repos, done) {
    // Assume the first repo has all the labels for now
    repos.first().labels().fetch({ success: done });
  }

  function flowLabels(labels) {
    return new GitHUD.Labels(labels.chain()
      .filter(function(label) {
        return label.get('name').match(/^\d+ - .+/);
      }).sortBy(function(label) {
        return parseInt(label.get('name'), 10);
      }).value());
  }

  function buildStages(labels, repos) {
    async.forEach(labels, function(label, labelDone) {
      async.forEach(repos, function(repo, repoDone) {
        repo.fetchIssuesLabelled(label, function(issues, models) {
          if (issues.size() > 0) label.get('issues').add(issues.models);
          repoDone();
        });
      }, labelDone);
    }, function() {
      labels.each(buildStage);
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

  function refreshStages() {
    stageViews.each(function(view) {
      view.render();
    });
  }

  function moveIssue(issue, from, to) {
    var that = this;
    issue.changeStage(from, to, {
      success: function() {
        from.get('issues').remove(issue);
        to.get('issues').add(issue);
      },
      error: GitHUD.Kanban.refreshStages
    });
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
    init : init,
    moveIssue : moveIssue,
    refreshStages : refreshStages
  };
})();

