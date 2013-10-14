q.ready(function() {

  /**
   * Disable/enable all widgets on each tab
   */
  var onDisable = function() {
    var enabled = !this.getAttribute("checked");
    q("#content > ul > .qx-tab-button")._forEachElementWrapped(function(button) {
      var selector = button.getData("qx-tab-page");
      var widgets = q(selector).getChildren("*[qx-class]");
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
  /**
   * Set the title of the tab with the given index as URL hash
   * @param index {Number} tab index
   */
  var onChangeSelected = function(index) {
    var buttonText = q("#content > ul > .qx-tab-button").eq(index).getChildren("button").getHtml();
    location.hash = buttonText;
  };


  qxWeb.initWidgets();
  q("#content")
  .on("changeSelected", onChangeSelected)
  q(".disable input").on("change", onDisable);


  var menu = q("#menu").addClass("qx-menu").appendTo(document.body).hide();
  q("#menu-button").setMenu(menu);

  q("div[qx-class='qx.ui.website.Rating']").setValue(2);

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


