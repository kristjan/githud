if (typeof GitHUD === 'undefined') GitHUD = {};

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
    labels: function() {
      return new GitHUD.Labels([], {repo: this});
    },
    url: function() {
      return GitHUD.Util.url('repos/' + this.get('handle'));
    }
  });

  GitHUD.Repos = Backbone.Collection.extend({});

  GitHUD.Issue = Backbone.Model.extend({
    initialize: function(options) {
      GitHUD.Util.initRepo(this, options);
      this.id = this.slug();
    },
    slug: function() {
      return GitHUD.Util.slug('issue',
               this.get('repo').get('handle') +
               '#' + this.get('number'));
    },
    url: function() {
      return GitHUD.Util.url(
        this.get('url') ||
        ('repos/' + this.get('repo').get('handle') +
         '/issues/' + this.get('number'))
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
    idAttribute: 'name',
    initialize: function(options) {
      GitHUD.Util.initRepo(this, options);
      this.set('issues', new GitHUD.LabelIssues([]));
      this.id = this.slug();
    },
    slug: function() {
      return GitHUD.Util.slug('label', this.get('name'));
    },
    url: function() {
      return GitHUD.Util.url('repos/' + this.get('repo').get('handle') +
                             '/labels/' + this.get('name'));
    }
  });

  GitHUD.Labels = Backbone.Collection.extend({
    model: GitHUD.Label,
    initialize: function(models, options) {
      GitHUD.Util.initRepo(this, options);
    },
    url: function() {
      return GitHUD.Util.url('repos/' + this.repo.get('handle') + '/labels');
    }
  });

  GitHUD.LabelIssues = Backbone.Collection.extend({
    model: GitHUD.Issue
  });
});
