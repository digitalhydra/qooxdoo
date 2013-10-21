q.ready(function() {
  var demos = {
    button : ["Default"],
    calendar : ["Default", "Customized"],
    rating : ["Default", "Custom Length", "Custom Symbol", "Custom Styling"],
    slider : ["Default", "Customized"],
    tabs : ["Default"]
  };

  /**
   * Disable/enable all widgets on each tab
   */
  var onDisable = function() {
    var enabled = !this.getAttribute("checked");
    q("#content > ul > .qx-tab-button")._forEachElementWrapped(function(button) {
      var selector = button.getData("qx-tab-page");
      var widgets = q(selector).find("*[data-qx-class]");
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

  var loadDemos = function(category) {
    demos[category] && demos[category].forEach(function(title) {
      loadDemo(category, title);
    });
  };


  var loadDemo = function(category, title) {
    var url = "demo/" + category + "/" + title + ".html";
    q.io.xhr(url).on("load", function(xhr) {
      if (xhr.status == 200) {
        var pageSelector = q("#content").find("> ul > .qx-tab-button-active").getData("qxTabPage");
        var demoCell = createDemoCell(title, xhr.responseText);
        q(pageSelector).getChildren(".demo-container").append(demoCell);

        var scripts = q.$$qx.bom.Html.extractScripts([demoCell[0]]);
        scripts.forEach(function(script) {
          eval(script.innerHTML);
        });
      }
      else {
        console.error("Could not load demo: ", xhr.status, xhr.statusText);
      }
    }).send();
  };


  var createDemoCell = function(demoTitle, demoCode) {
    var demoCell = q.create("<div class='demo-cell'>").setHtml(demoCode);
    q.create("<h2>" + demoTitle + "</h2>").insertBefore(demoCell.getChildren().getFirst());

    q.create("<p class='code-header'>Demo Code</p>").appendTo(demoCell);
    pre = q.create("<pre class='demo-cell html'></pre>");
    q.create("<code>").appendTo(pre)[0].appendChild(document.createTextNode(demoCode));
    pre.appendTo(demoCell);
    hljs.highlightBlock(pre[0]);

    return demoCell;
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
    if (q(demoPageSelector).getChildren(".demo-container").getChildren().length > 0) {
      return;
    }
    var demoName = demoPageSelector.match(/#(.*?)-/)[1];
    loadDemos(demoName);
  };

  var parseDemoCode = function(code) {
    code = code.replace(/<h2.*?<\/h2>/g, "");

    code = code.split("\n").filter(function(item) {
      return !!item.match(/\S/);
    }).join("\n");

    return code;
  };


  window.widgetbrowser = {};
  widgetbrowser.showCode = function(selector) {
    if ((q.env.get("engine.name") == "mshtml" && q.env.get("browser.documentmode") < 9)) {
      return;
    }
    q(selector + " .demo-cell")._forEachElementWrapped(function(demo) {
      var demoHtml = demo.getProperty("demoCode");

      q.create("<h2>Demo Code</h2>").appendTo(demo);
      pre = q.create("<pre class='demo-cell html'></pre>");
      q.create("<code>").appendTo(pre)[0].appendChild(document.createTextNode(demoHtml));

      pre.appendTo(demo);
      hljs.highlightBlock(pre[0]);
    });
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


