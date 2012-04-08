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
});

