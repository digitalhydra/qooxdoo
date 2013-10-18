widgetbrowser.showCode("#demo-rating");
q.initWidgets("#demo-rating");
var value = 1;
q("#demo-rating").find(".qx-rating").forEach(function(el) {
  q(el).setValue(value++);
});
