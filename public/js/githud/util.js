if (typeof GitHUD === 'undefined') GitHUD = {};

GitHUD.Util = (function() {
  var API_BASE = 'https://api.github.com/';

  function initRepo(obj, options) {
    var repo;
    if (options) repo = options.repo;
    if (typeof repo === 'string') repo = new GitHUD.Repo(options.repo);

    if (!repo && obj.collection) repo = obj.collection.repo;

    if (typeof obj.set === 'function') obj.set('repo', repo);
    else obj.repo = repo;
  }

  function slug(type, name) {
    return type + '-' + name.toString().replace(/\s/g, '');
  }

  function url(path, params) {
    var u = path;
    if (!path.match(/^http/i)) u = API_BASE + path;
    u += '?access_token=' + $.cookie('githubToken');
    if (params) {
      _.each(_.keys(params), function(k) {
        u += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
      });
    }
    return u;
  }

  /* --- UI management --- */
  function resizeUI() {
    resizeContent();
    resizeStages();
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
      list.height(stage.height() - list.siblings('h1:first').outerHeight());
    });
  }

  return {
    API_BASE : API_BASE,
    initRepo : initRepo,
    resizeUI : resizeUI,
    slug     : slug,
    url      : url
  };
})();
