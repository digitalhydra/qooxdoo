q.initWidgets("#demo-tabs");
q("#tabs-page input[type='radio']").on("change", function(e) {
  var val = e.getTarget().value;
  q("#tabs-page .qx-tabs").setConfig("align", val).render();
});
