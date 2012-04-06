if (typeof GitHUD === 'undefined') GitHUD = {};

GitHUD.Core = (function() {
  function init() {
    console.log("OK");
  }

  return {
    init : init
  };
})();

$(GitHUD.Core.init);
