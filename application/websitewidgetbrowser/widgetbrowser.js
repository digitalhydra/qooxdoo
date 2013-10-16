q.ready(function() {

  /**
   * Disable/enable all widgets on each tab
   */
  var onDisable = function() {
    var enabled = !this.getAttribute("checked");
    q("#content > ul > .qx-tab-button")._forEachElementWrapped(function(button) {
      var selector = button.getData("qx-tab-page");
      var widgets = q(selector).getChildren("*[data-qx-class]");
      if (widgets.length > 0) {
        widgets.setEnabled(enabled);
      }
    });
  };

  /**
   * Select the tab with the given title
   * @param title {String} Tab (button) title
   */
  var selectTab = function(title) {
    var tabs = q("#content > ul > .qx-tab-button");
    var selectedTab = tabs.has("button:contains(" + title + ")");
    if (selectedTab.length > 0) {
      var index = tabs.indexOf(selectedTab);
      q("#content").select(index);
    }
  };


  var loadDemo = function(demo) {
    q.io.xhr("demo/" + demo + ".html").on("load", function(xhr) {
      if (xhr.status == 200) {
        var pageSelector = q("#content").find("> ul > .qx-tab-button-active").getData("qxTabPage");
        q(pageSelector).setHtml(xhr.responseText);
        q.io.script("demo/" + demo + ".js").send();
      }
      else {
        console.error("Could not load demo: ", xhr.status, xhr.statusText);
      }
    }).send();
  };


  /**
   * Set the title of the tab with the given index as URL hash
   * @param index {Number} tab index
   */
  var onChangeSelected = function(index) {
    var button = q("#content > ul > .qx-tab-button").eq(index);
    var buttonText = button.getChildren("button").getHtml();
    location.hash = buttonText;

    var demoPageSelector = button.getData("qxTabPage");
    if (q(demoPageSelector).getChildren(".demo-container").length > 0) {
      return;
    }
    var demoName = demoPageSelector.match(/#(.*?)-/)[1];
    loadDemo(demoName);
  };


  qxWeb.initWidgets();

  q("#content")
  .on("changeSelected", onChangeSelected);

  q(".disable input").on("change", onDisable);


  // select tab by URL hash or select the tabs widget's default
  setTimeout(function() {
    var selected;
    if (location.hash.length > 0) {
      selected = location.hash.substr(1);
    } else {
      selected = q("#content").tabs().find(".qx-tab-button-active").getChildren("button").getHtml();
    }
    selectTab(selected);
  }, 100);

});


