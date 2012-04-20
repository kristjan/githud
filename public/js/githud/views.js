if (typeof GitHUD === 'undefined') GitHUD = {};

$(function() {
  _.templateSettings = {
    interpolate : /\{\{=(.+?)\}\}/g,
    escape      : /\{\{-(.+?)\}\}/g,
    evaluate    : /\{\{(.+?)\}\}/g
  };

  GitHUD.IssueView = Backbone.View.extend({
    tagName: 'li',
    className: 'issue',
    template: _.template($('#issue').html()),
    render: function() {
      this.$el.attr('id', this.model.slug()).
               html(this.template(this.model.toJSON()));
      return this;
    }
  });

  GitHUD.StageView = Backbone.View.extend({
    className: 'stage',
    template: _.template($('#stage').html()),
    initialize: function(options) {
      _(this).bindAll('add', 'remove');
      this.issueViews = [];
      this.issues = this.model.get('issues');
      this.issues.each(this.add);
      this.issues.bind('add', this.add);
      this.issues.bind('remove', this.remove);
    },
    add: function(issue) {
      if (!_(this.issueViews)
           .find(function(view) {return view.model === issue;})) {
        this.issueViews.push(new GitHUD.IssueView({ model: issue }));
        if (this.rendered) this.render();
      }
    },
    remove: function(issue) {
      this.issueViews = _(this.issueViews)
        .reject(function(view) {
          return view.model === issue;
        });
      if (this.rendered) this.render();
    },
    render: function() {
      this.rendered = true;
      this.$el.attr('id', this.model.slug()).
               html(this.template(this.model.toJSON()));
      var issues = this.$('.issues');
      _.each(this.issueViews, function(issueView) {
        issues.append(issueView.render().el);
      });
      $(this.$('ul')).sortable({
        connectWith: '.stage ul',
        opacity: 0.6,
        update: function(evt, ui) {
          // Two events are fired during a list change: one for the old list and
          // one for the new one. The old list has nothing to do.
          if (!ui.sender) return;
          var from = GitHUD.labels.get($(ui.sender).closest('.stage').attr('id')),
              to   = GitHUD.labels.get($(this).closest('.stage').attr('id')),
              issue = from.get('issues').get($(ui.item).attr('id'));
          GitHUD.Kanban.moveIssue(issue, from, to);
        }
      });
      GitHUD.Util.resizeUI();
      return this;
    }
  });

  GitHUD.RepoNavItem = Backbone.View.extend({
    tagName: 'li',
    className: 'repo-nav-item dropdown',
    template: _.template($('#repo-nav-item').html()),
    initialize: function(options) {
      this.render();
    },
    render: function(options) {
      this.$el.attr('id', this.model.id)
              .html(this.template(this.model.toJSON()));
      return this;
    }
  });

  GitHUD.RepoNavList = Backbone.View.extend({
    tagName: 'ul',
    className: 'nav nav-pills',
    events: {
      "submit .add-repo"    : "addRepo",
      "click  .remove-repo" : "removeRepo"
    },
    template: _.template($('#repo-nav-list').html()),
    initialize: function(options) {
      _(this).bindAll('add', 'remove');
      var that = this;
      this.itemViews = [];

      this.collection.each(this.add);
      this.collection.bind('add', this.add);
      this.collection.bind('remove', this.remove);
      this.render();
    },
    render: function(options) {
      var that = this;
      this.rendered = true;
      this.$el.attr('id', 'repo-nav').html(this.template(this.collection.toJSON));
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
    remove: function(repo) {
              console.log("Removing", repo);
              console.log(this.itemViews);
      this.itemViews = _.reject(this.itemViews, function(view) {
        console.log("Checking", view.model);
        return view.model.get('handle') === repo.get('handle');
      });
      if (this.rendered) this.render();
    },
    addRepo: function(evt) {
      evt.preventDefault();
      var input = $(evt.target).closest('form').find('input[type=text]');
      GitHUD.Core.addRepo(input.val());
    },
    removeRepo: function(evt) {
      evt.preventDefault();
      var repoID = $(evt.target).closest('.repo-nav-item').attr('id');
      console.log("Repo ID", repoID);
      GitHUD.Core.removeRepo(GitHUD.repos.get(repoID));
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

  GitHUD.UserInfoView = Backbone.View.extend({
    idAttribute: 'login',
    template: _.template($('#logged-in-user').html()),
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
    }
  });
});
