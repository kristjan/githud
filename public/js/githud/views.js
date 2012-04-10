if (typeof GitHUD === 'undefined') GitHUD = {};

$(function() {
  _.templateSettings = {
    interpolate : /\{\{=(.+?)\}\}/g
  };

  GitHUD.IssueView = Backbone.View.extend({
    tagName: 'li',
    className: 'issue',
    template: _.template($('#issue').html()),
    initialize: function(options) {
      if (options && options.model) this.id = options.model.slug();
      this.render();
    },
    render: function() {
      this.$el.attr('id', this.id).html(this.template(this.model.toJSON()));
      return this;
    }
  });

  GitHUD.StageView = Backbone.View.extend({
    className: 'stage',
    template: _.template($('#stage').html()),
    initialize: function(options) {
      if (options && options.model) this.id = options.model.slug();
      _(this).bindAll('add');
      this.issueViews = [];
      this.issues = this.model.get('issues');
      this.issues.each(this.add);
      this.issues.bind('add', this.add);
    },
    add: function(issue) {
      this.issueViews.push(new GitHUD.IssueView({ model: issue }));
      if (this.rendered) this.render();
    },
    render: function() {
      this.rendered = true;
      this.$el.attr('id', this.id).html(this.template(this.model.toJSON()));
      var issues = this.$('.issues');
      _.each(this.issueViews, function(issueView) {
        issues.append(issueView.render().el);
      });
      return this;
    }
  });

  GitHUD.RepoNavItem = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#repo-nav-item').html()),
    initialize: function(options) {
      this.render();
    },
    render: function(options) {
      this.$el.attr('class', 'active').html(this.template(this.model.toJSON()));
      return this;
    }
  });

  GitHUD.RepoNavList = Backbone.View.extend({
    tagName: 'ul',
    className: 'nav nav-pills',
    events: {
      "submit .add-repo": "createRepo"
    },
    template: _.template($('#repo-nav-list').html()),
    initialize: function(options) {
      _(this).bindAll('add', 'remove');
      var that = this;
      this.itemViews = [];
      this.id = 'repo-nav';

      this.collection.each(this.add);
      this.collection.bind('add', this.add);
      this.render();
    },
    render: function(options) {
      var that = this;
      this.rendered = true;
      this.$el.attr('id', this.id).html(this.template(this.collection.toJSON));
      var addRepo = this.$('li:last-child');
      _.each(this.itemViews, function(item) {
        addRepo.before(item.render().el);
      });
      return this;
    },
    add: function(repo) {
      this.itemViews.push(new GitHUD.RepoNavItem({ model: repo }));
      if (this.rendered) this.render();
    },
    createRepo: function(evt) {
      evt.preventDefault();
      var input = $(evt.target).closest('form').find('input[type=text]');
      GitHUD.Core.addRepo(input.val());
    }
  });

  GitHUD.LoginPrompt = Backbone.View.extend({
    tagName: 'div',
    className: 'login-prompt hero-unit',
    template: _.template($('#login-prompt').html()),
    render: function() {
      this.$el.html(this.template());
      return this;
    }
  });
});
