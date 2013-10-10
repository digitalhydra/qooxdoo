/**
 * @require(qx.module.Template)
 */
qx.Bootstrap.define("qx.ui.website.Tabs", {
  extend : qx.ui.website.Widget,

  statics : {
    _templates : {
      button : "<li><button>{{{content}}}</button></li>"
    },

    _config : {
      align : "left" // "justify", "right"
    }
  },


  construct : function(selector, context) {
    this.base(arguments, selector, context);

    this._forEachElementWrapped(function(tabs) {
      tabs.addClass("qx-tabs");

      if (tabs.getChildren("ul").length === 0) {
        tabs.append(qxWeb.create("<ul/>"));
      }

      var buttons = tabs.find("ul > li");
      buttons.addClass("qx-tab-button")._forEachElementWrapped(function(button) {
        tabs._showPage(button, false);
        button.onWidget("click", this.__onClick, tabs);


        var pageSelector = button.getData("qx-tab-page");
        if (pageSelector) {
          qxWeb(pageSelector).addClass("qx-tab-page");
        }
      }.bind(this));

      var active = buttons.filter(".qx-tab-button-active");
      if (active.length == 0) {
        buttons.eq(0).addClass("qx-tab-button-active");
      }
      tabs._showPage(buttons.filter(".qx-tab-button-active"));
    }.bind(this));
  },


  events : {
    "changeSelected" : "Number"
  },


  members : {
    render : function() {
      this._forEachElementWrapped(function(tabs) {
        var content = [];
        var pages= [];
        var selected;
        tabs.find("ul > .qx-tab-button")._forEachElementWrapped(function(li) {
          li.offWidget("click", tabs.__onClick, tabs);
          pages.push(li.getData("qx-tab-page"));
          content.push(li.find("button").getHtml());
          if (li.hasClass("qx-tab-button-active")) {
            selected = content.length - 1;
          }
          li.remove();
        });

        var toRight = this.getConfig("align") == "right" && !tabs.find("ul").hasClass("qx-tabs-right");
        var fromRight = this.getConfig("align") != "right" && tabs.find("ul").hasClass("qx-tabs-right");
        if (toRight || fromRight) {
          content.reverse();
          pages.reverse();
          selected = content.length - 1 - selected;
        }

        content.forEach(function(content, i) {
          tabs.addButton(content, pages[i]);
          tabs._showPage(tabs.find("ul > .qx-tab-button:last-child"), i == selected);
          if (i == selected) {
            tabs.find("ul > .qx-tab-button:first-child").removeClass("qx-tab-button-active");
            tabs.find("ul > .qx-tab-button:last-child").addClass("qx-tab-button-active");
          }
        });

        tabs.find("ul").removeClasses(["qx-tabs-justify", "qx-tabs-right"]);

        var align = tabs.getConfig("align");
        if (align == "justify") {
          tabs.find("ul").addClass("qx-tabs-justify");

        } else if (align == "right") {
          tabs.find("ul").addClass("qx-tabs-right");
        }
      });

      return this;
    },


    addButton : function(button, page) {
      this._forEachElementWrapped(function(item) {

        var link = qxWeb.create(
          qxWeb.template.render(
            item.getTemplate("button"),
            {content: button}
          )
        ).appendTo(item.find("ul"))
        .onWidget("click", this.__onClick, item)
        .addClass("qx-tab-button");
        if (item.find("ul .qx-tab-button").length === 1) {
          link.addClass("qx-tab-button-active");
        }

        if (page) {
          link.setData("qx-tab-page", page);
          this._showPage(link, false);
        }
      }, this);

      return this;
    },


    select : function(index) {
      this._forEachElementWrapped(function(tabs) {
        var buttons = tabs.find("ul .qx-tab-button").removeClass("qx-tab-button-active")
        ._forEachElementWrapped(function(button) {
          tabs._showPage(button, false);
        });
        if (this.getConfig("align") == "right") {
          index = buttons.length -1 - index;
        }
        var selected = buttons.eq(index).addClass("qx-tab-button-active");
        tabs._showPage(selected);
        tabs.emit("changeSelected", index);
      });

      return this;
    },


    __onClick : function(e) {
      this._forEachElementWrapped(function(tabs) {
        var buttons = tabs.find("ul > .qx-tab-button");
        var selected;
        buttons._forEachElementWrapped(function(button) {
          tabs._showPage(button, false);
          button.removeClass("qx-tab-button-active");
          if (e.getCurrentTarget() === button[0]) {
            selected = button;
          }
        });
        tabs._showPage(selected);
        selected.addClass("qx-tab-button-active");
        var index = buttons.indexOf(selected[0]);
        if (this.getConfig("align") == "right") {
          index = buttons.length - 1 - index;
        }
        tabs.emit("changeSelected", index);
      });
    },


    _showPage : function(button, show) {
      var pageSelector = button.getData("qx-tab-page");
      if (pageSelector) {
        show === false ? qxWeb(pageSelector).hide() : qxWeb(pageSelector).show();
      }
    },


    dispose : function() {
      this._forEachElementWrapped(function(tabs) {
        tabs.find(".qx-tab-button").offWidget("click", this.__onClick, tabs);
      });

      this.setHtml("").removeClass("qx-tabs");

      return this.base(arguments);
    }

  },


  defer : function(statics) {
    qxWeb.$attach({
      tabs : function(align) {
        var tabs =  new qx.ui.website.Tabs(this);
        if (align) {
          tabs.setConfig("align", align);
          tabs.render();
        }

        return tabs;
      }
    });
  }
});
