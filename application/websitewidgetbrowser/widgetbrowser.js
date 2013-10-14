q.ready(function() {
  //qxWeb.initWidgets();

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
  q(".disable input").on("change", onDisable);

  var menu = q("#menu").addClass("qx-menu").appendTo(document.body).hide();
  q("#menu-button").setMenu(menu);

});

