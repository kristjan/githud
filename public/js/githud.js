if (typeof GitHUD === 'undefined') GitHUD = {};

GitHUD.Core = (function() {
  function init() {
    var repo = new GitHUD.Repo('kristjan/playground');
    repo.labels().fetch({success: loadStages});
    $(window).resize(resizeUI);
    resizeUI();
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
    init : init
  };
})();

$(GitHUD.Core.init);
