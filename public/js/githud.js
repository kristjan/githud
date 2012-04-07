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
      var label = labels.get(step.name);
      printLabel(label);
      label.issues().fetch({
        success: function(issues, models) {
          printIssues(label, issues);
        }
      });
    });
  }

  function printLabel(label) {
    $('#content').append(
      $('<div>', {
        id: slug('label', label.get('name'))
      }).append(
        $('<h1>', {text: label.get('name')})
      )
    );
  }

  function printIssues(label, issues) {
    var issueList = $('<ul>');
    _.each(issues.models, function(issue) {
      issueList.append($('<li>', {
        text: issue.get('title')
      }));
    });
    var id = '#' + slug('label', label.get('name'));
    $(id).append(issueList);
  }

  function slug(type, name) {
    return type + name.replace(/[^\-_0-9a-z]/ig, '');
  }

  return {
    init : init
  };
})();

$(GitHUD.Core.init);
