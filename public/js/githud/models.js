if (typeof GitHUD === 'undefined') GitHUD = {};

Backbone.origSync = Backbone.sync;
Backbone.sync = function(method, model, options) {
  return Backbone.origSync(method, model, options);
};

$(function() {
  GitHUD.Repo = Backbone.Model.extend({
    initialize: function(handle) {
      var parts = [];
      if (typeof handle === 'string') {
        parts = handle.split('/');
        if (parts.length !== 2)
          throw new Error('Repo must be referenced as "user/name"');
        this.set('user', parts[0]);
        this.set('name', parts[1]);
      }
      this.set('handle', this.get('user') + '/' + this.get('name'));
    },
    fetchIssuesLabelled: function(label, done) {
      new GitHUD.Issues([], {
        repo: this,
        labels: [label]
      }).fetch({
        success: done
      });
    },
    labels: function() { return new GitHUD.Labels([], {repo: this}); },
    path: function() { return 'repos/' + this.get('handle'); },
    url: function() { return GitHUD.Util.url(this.path()); }
  });

  GitHUD.Repos = Backbone.Collection.extend({});

  GitHUD.Issue = Backbone.Model.extend({
    initialize: function(options) {
      GitHUD.Util.initRepo(this, options);
      this.id = this.slug();
    },
    changeStage: function(from, to, callbacks) {
      var oldLabel = new GitHUD.Label({issue: this, name: from.get('name')});
      var labels   = new GitHUD.Labels([], {issue: this});
      $.post(
        labels.url(),
        JSON.stringify([to.get('name')]),
        function(data, status, xhr) {
          $.ajax({
            type: 'DELETE',
            url: oldLabel.url(),
            success: callbacks.success,
            dataType: 'json'
          }).error(callbacks.error);
        }
      ).error(callbacks.error);
    },
    slug: function() {
      return GitHUD.Util.slug('issue',
               this.get('repo').get('handle') +
               '#' + this.get('number'));
    },
    path: function() {
      return 'repos/' + this.get('repo').get('handle') +
             '/issues/' + this.get('number');
    },
    url: function() {
      return GitHUD.Util.url(
        this.get('url') || this.path()
      );
    }
  });

  GitHUD.Issues = Backbone.Collection.extend({
    model: GitHUD.Issue,
    initialize: function(models, options) {
      GitHUD.Util.initRepo(this, options);
      this.labels = options.labels;
    },
    url: function() {
      var options = {};
      if (this.labels) options.labels = _(this.labels).map(function(label) {
        return label.get('name');
      }).join(',');
      return GitHUD.Util.url('repos/' + this.repo.get('handle') + '/issues',
                             options);
    }
  });

  GitHUD.Label = Backbone.Model.extend({
    initialize: function(options) {
      GitHUD.Util.initRepo(this, options);
      this.issue = options.issue;
      this.set('issues', new GitHUD.LabelIssues([], {issue: this.issue}));
      this.id = this.slug();
    },
    slug: function() {
      return GitHUD.Util.slug('label', this.get('name'));
    },
    path: function() {
      var name = encodeURIComponent(this.get('name'));
      if (this.collection) {
        return this.collection.path() + '/' + name;
      }
      var base = this.get('issue') || this.get('repo');
      return base.path() + '/labels' + '/' + name;
    },
    url: function() {
      return GitHUD.Util.url(this.path());
    }
  });

  GitHUD.Labels = Backbone.Collection.extend({
    model: GitHUD.Label,
    initialize: function(models, options) {
      GitHUD.Util.initRepo(this, options);
      if (options) this.issue = options.issue;
    },
    path: function(){
      var base = this.issue || this.repo;
      return base.path()+ '/labels';
    },
    url: function() {
      return GitHUD.Util.url(this.path());
    }
  });

  GitHUD.LabelIssues = Backbone.Collection.extend({
    model: GitHUD.Issue
  });

  GitHUD.User = Backbone.Model.extend({
    url: function() {
      return GitHUD.Util.url('user');
    }
  });
});
