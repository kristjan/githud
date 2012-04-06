if (typeof GitHUD === 'undefined') GitHUD = {};

GitHUD.Core = (function() {
  function init() {
    console.log($.cookie('githubToken'));
  }

  return {
    init : init
  };
})();

$(GitHUD.Core.init);
