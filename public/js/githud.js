if (typeof GitHUD === 'undefined') GitHUD = {};

GitHUD.Core = (function() {
  function init() {
    var repo = new GitHUD.Repo('kristjan/playground');
    repo.labels().fetch({success: loadFlowLabels});
  }

  function loadFlowLabels(labels, models) {
    var flow = _.chain(models)
      .filter(function(model) {
        return model.name.match(/^\d+ - .+/);
      }).sortBy(function(model) {
        return model.name;
      }).value();

    _.each(flow, function(step) {
      printLabel(labels.get(step.name));
    });
  }

  function printLabel(label) {
    var view = new GitHUD.StageView({ model: label });
    $('#content').append(view.el);
  }

  return {
    init : init
  };
})();

$(GitHUD.Core.init);
