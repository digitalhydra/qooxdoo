q.ready(function() {
  //qxWeb.initWidgets();

  var menu = q("#menu").addClass("qx-menu").appendTo(document.body).hide();
  q("#menu-button").setMenu(menu);

  q(".disable input").on("change", onDisable);
});

var onDisable = function() {
  var enabled = !this.getAttribute("checked");
  q("#content > ul > .qx-tab-button")._forEachElementWrapped(function(button) {
    var selector = button.getData("qx-tab-page");
    q(selector).getChildren("*[qx-class]").setEnabled(enabled);
  });
};
