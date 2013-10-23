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

  var demosToLoad;
  var loadedDemos;
  var loadDemos = function(category) {
    loadedDemos = {};
    demosToLoad = 0;
    demos[category] && demos[category].forEach(function(title) {
      loadDemo(category, title);
    });
  };


  /**
   * Load the requested demo file and prepare the content
   * @param category {String} The demo's category (see the demos map)
   * @param title {String} The demo's title (see the demos map)
   */
  var loadDemo = function(category, title) {
    demosToLoad++;
    var url = "demo/" + category + "/" + title + ".html";
    q.io.xhr(url).on("load", function(xhr) {
      if (xhr.status == 200) {
        loadedDemos[title] = createDemoCell(title, xhr.responseText);
        demosToLoad--;
        if (demosToLoad === 0) {
          appendDemos(category);
        }
      }
      else {
        console && console.error("Could not load demo: ", xhr.status, xhr.statusText);
      }
    }).send();
  };


  /**
   * Append each previously loaded demo to the page and executes the
   * demo code
   * @param category {String} The category of the demos (see demos map)
   */
  var appendDemos = function(category) {
    var pageSelector = q("#content").find("> ul > .qx-tab-button-active").getData("qxTabPage");

    demos[category].forEach(function(title) {
      var demoCell = loadedDemos[title];
      q(pageSelector).getChildren(".demo-container").append(demoCell);
      var scripts = q.$$qx.bom.Html.extractScripts([demoCell[0]]);
      scripts.forEach(function(script) {
        eval(script.innerHTML);
      });
    });
  };


  /**
   * Create the DOM structure for a demo and the box showing the demo's code
   * @param demoTitle {String} The demo's title (see the demos map)
   * @param demoCode {String} The demo's JavaScript code
   */
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


  qxWeb.initWidgets();

  q("#content")
  .on("changeSelected", onChangeSelected);

  q(".disable input").on("change", onDisable);

  q("#sizeSlider")
  .setTemplate("knobContent", "{{value}}%").render()
  .on("changeValue", function(value) {
    q("html").setStyle("font-size", value + "%");
  });


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


