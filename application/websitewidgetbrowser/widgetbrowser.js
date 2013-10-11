q.ready(function() {
  qxWeb.initWidgets();

  var menu = q("#menu").addClass("qx-menu").appendTo(document.body).hide();
  q("#menu-button").setMenu(menu);

  q(".disable input").on("change", onDisable);
});

var onDisable = function() {
  var enabled = !this.getAttribute("checked");
  var selector = q("#content > ul > .qx-tab-button-active").getData("qx-tab-page");
  q(selector).getChildren("*[qx-class]")._forEachElementWrapped(function(widget) {
    widget.setEnabled(enabled);
  });
};
