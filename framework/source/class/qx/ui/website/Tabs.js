/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

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
  },


  events : {
    "changeSelected" : "Number",
    "changePage" : "Map"
  },


  members : {

    init : function() {
      if (!this.base(arguments)) {
        return false;
      }

      this._forEachElementWrapped(function(tabs) {

        tabs.addClass("qx-tabs");

        if (tabs.getChildren("ul").length === 0) {
          tabs.append(qxWeb.create("<ul/>"));
        }

        var buttons = tabs.getChildren("ul").getFirst().getChildren("li");
        buttons.addClass("qx-tab-button")._forEachElementWrapped(function(button) {
          tabs._getPage(button).hide();
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

        tabs.getChildren("ul").getFirst().onWidget("keydown", this._onKeyDown, this);
      }.bind(this));

      return true;
    },

    render : function() {
      this._forEachElementWrapped(function(tabs) {
        var content = [];
        var pages= [];
        var selected;
        tabs.find("> ul > .qx-tab-button")._forEachElementWrapped(function(li) {
          li.offWidget("click", tabs.__onClick, tabs);
          pages.push(li.getData("qx-tab-page"));
          content.push(li.find("> button").getHtml());
          if (li.hasClass("qx-tab-button-active")) {
            selected = content.length - 1;
          }
        });

        tabs.find("> ul").setHtml("");

        var toRight = this.getConfig("align") == "right" && !tabs.find("> ul").hasClass("qx-tabs-right");
        var fromRight = this.getConfig("align") != "right" && tabs.find("> ul").hasClass("qx-tabs-right");
        if (toRight || fromRight) {
          content.reverse();
          pages.reverse();
          selected = content.length - 1 - selected;
        }

        content.forEach(function(content, i) {
          tabs.addButton(content, pages[i]);
          var page = tabs._getPage(tabs.find("> ul > .qx-tab-button:last-child"));
          if (i == selected) {
            tabs.find("> ul > .qx-tab-button:first-child").removeClass("qx-tab-button-active");
            tabs.find("> ul > .qx-tab-button:last-child").addClass("qx-tab-button-active");
            page.show();
          } else {
            page.hide();
          }
        });

        tabs.find("> ul").removeClasses(["qx-tabs-justify", "qx-tabs-right"]);

        var align = tabs.getConfig("align");
        if (align == "justify") {
          tabs.find("> ul").addClass("qx-tabs-justify");

        } else if (align == "right") {
          tabs.find("> ul").addClass("qx-tabs-right");
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
        ).appendTo(item.find("> ul"))
        .onWidget("click", this.__onClick, item)
        .addClass("qx-tab-button");
        if (item.find("> ul .qx-tab-button").length === 1) {
          link.addClass("qx-tab-button-active");
        }

        if (page) {
          link.setData("qx-tab-page", page);
          this._getPage(link).hide();
        }
      }, this);

      return this;
    },


    select : function(index) {
      this._forEachElementWrapped(function(tabs) {
        var buttons = tabs.find("> ul > .qx-tab-button");
        var oldButton = tabs.find("> ul > .qx-tab-button-active").removeClass("qx-tab-button-active");
        if (this.getConfig("align") == "right") {
          index = buttons.length -1 - index;
        }
        var newButton = buttons.eq(index).addClass("qx-tab-button-active");
        tabs._showPage(newButton, oldButton);
        tabs.emit("changeSelected", index);
      });

      return this;
    },


    __onClick : function(e) {
      this._forEachElementWrapped(function(tabs) {
        var oldButton = tabs.find("> ul > .qx-tab-button-active").removeClass("qx-tab-button-active");
        var newButton;
        var buttons = tabs.find("> ul > .qx-tab-button")._forEachElementWrapped(function(button) {
          if (e.getCurrentTarget() === button[0]) {
            newButton = button;
          }
        });
        tabs._showPage(newButton, oldButton);
        newButton.addClass("qx-tab-button-active");
        var index = buttons.indexOf(newButton[0]);
        if (this.getConfig("align") == "right") {
          index = buttons.length - 1 - index;
        }
        tabs.emit("changeSelected", index);
      });
    },


    /**
     * Allows tab selection using the left and right arrow keys
     * @param e {Event} keydown event
     */
    _onKeyDown : function(e) {
      var key = e.getKeyIdentifier();
      if (!(key == "Left" || key == "Right")) {
        return;
      }
      var rightAligned = this.getConfig("align") == "right";
      var buttons = this.find("> ul > .qx-tab-button");
      if (rightAligned) {
        buttons.reverse();
      }
      var active = this.find("> ul > .qx-tab-button-active");
      var next;
      if (key == "Right") {
        if (!rightAligned) {
          next = active.getNext(".qx-tab-button");
        } else {
          next = active.getPrev(".qx-tab-button");
        }
      } else {
        if (!rightAligned) {
          next = active.getPrev(".qx-tab-button");
        } else {
          next = active.getNext(".qx-tab-button");
        }
      }

      if (next.length > 0) {
        var idx = buttons.indexOf(next);
        this.select(idx);
      }
    },


    _showPage : function(newButton, oldButton) {
      if (this.hasListener("changePage")) {
        this.emit("changePage", {
          "new" : this._getPage(newButton),
          "old" : this._getPage(oldButton)
        });
      } else {
        this.changePage(this._getPage(newButton), this._getPage(oldButton));
      }
    },


    _getPage : function(button) {
      var pageSelector;
      if (button) {
        pageSelector = button.getData("qx-tab-page");
      }
      return qxWeb(pageSelector);
    },


    changePage : function(newPage, oldPage) {
      if (oldPage) {
        oldPage.hide();
      }
      newPage.show();
    },


    dispose : function() {
      this._forEachElementWrapped(function(tabs) {
        tabs.find(".qx-tab-button").offWidget("click", tabs.__onClick, tabs);
        tabs.getChildren("ul").getFirst().offWidget("keydown", tabs._onKeyDown, tabs)
        .setHtml("");
      });

      this.setHtml("").removeClass("qx-tabs");

      return this.base(arguments);
    }

  },


  defer : function(statics) {
    qxWeb.$attach({
      tabs : function(align) {
        var tabs =  new qx.ui.website.Tabs(this);
        tabs.init();
        if (align) {
          tabs.setConfig("align", align);
          tabs.render();
        }

        return tabs;
      }
    });
  }
});
