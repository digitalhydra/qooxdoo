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

qx.Bootstrap.define("qx.ui.website.Rating", {
  extend : qx.ui.website.Widget,


  statics : {
    _config : {
      length : 5,
      symbol : "★"
    }
  },


  construct : function(selector, context) {
    this.base(arguments, selector, context);
  },


  events : {
    /** Fired at each value change */
    "changeValue" : "Number"
  },


  members : {

    init : function() {
      if (!this.base(arguments)) {
        return false;
      }

      this._updateSymbolLength();

      this._forEachElementWrapped(function(rating) {
        if (rating.getAttribute("tabindex") < 0) {
          rating.setAttribute("tabindex", 0);
        }
        rating.addClass("qx-rating")
        .onWidget("focus", this._onFocus, rating)
        .onWidget("blur", this._onBlur, rating)
        .getChildren("span")
          .addClasses(["qx-rating-item", "qx-rating-item-off"])
          .onWidget("click", this._onClick, rating);
      }.bind(this));

      return true;
    },


    setValue : function(value) {
      this._forEachElementWrapped(function(rating) {
        var children = rating.getChildren("span");
        children.removeClass("qx-rating-item-off");
        children.slice(value, children.length).addClass("qx-rating-item-off");
        rating.emit("changeValue", rating.getValue());
      });
      return this;
    },


    getValue : function() {
      return this.eq(0).getChildren("span").not(".qx-rating-item-off").length;
    },


    render : function() {
      this._updateSymbolLength();
    },


    _updateSymbolLength : function() {
      var length = this.getConfig("length");
      this._forEachElementWrapped(function(el) {
        var children = el.getChildren();
        children.setHtml(this.getConfig("symbol"));
        var diff = length - children.length;
        if (diff > 0) {
          for (var i = 0; i < diff; i++) {
            qxWeb.create("<span>" + this.getConfig("symbol") + "</span>")
            .onWidget("click", el._onClick, el)
            .addClass("qx-rating-item")
            .appendTo(el);
          }
        } else {
          for (var i = 0; i < Math.abs(diff); i++) {
            el.getChildren().getLast()
            .offWidget("click", el._onClick, el)
            .remove();
          }
        }
      }.bind(this));
      return this;
    },


    _onClick : function(e) {
      var parents = qxWeb(e.getTarget()).getParents();
      this.setValue(parents.getChildren().indexOf(e.getTarget()) + 1);
    },


    /**
     * Attaches the keydown listener
     * @param e {Event} focus event
     */
    _onFocus : function(e) {
      qxWeb(document.documentElement).on("keydown", this._onKeyDown, this);
    },


    /**
     * Removes the keydown listener if the widget loses focus
     */
    _onBlur : function(e) {
      if (this.contains(e.getRelatedTarget()).length === 0) {
        qxWeb(document.documentElement).off("keydown", this._onKeyDown, this);
      }
    },


    /**
     * Changes the value if the left or right arrow key is pressed
     * @param e {Event} keydown event
     */
    _onKeyDown : function(e) {
      var key = e.getKeyIdentifier();
      if (key === "Right") {
        this.setValue(this.getValue() + 1);
      } else if (key === "Left") {
        this.setValue(this.getValue() - 1);
      }
    },


    dispose : function() {
      this._forEachElementWrapped(function(rating) {
        rating.getChildren("span").offWidget("click", rating._onClick, rating);
      });
      this.setHtml("");

      qxWeb(document.documentElement).off("keydown", this._onKeyDown, this);

      return this.base(arguments);
    }
  },


  defer : function(statics) {
    qxWeb.$attach({
      rating : function(initValue, symbol, length) {
        var rating =  new qx.ui.website.Rating(this);
        rating.init();

        var modified = false;
        if (length != undefined && length != rating.getConfig("length")) {
          rating.setConfig("length", length);
          modified = true;
        }

        if (symbol != undefined) {
          rating.setConfig("symbol", symbol);
          modified = true;
        }

        if (modified) {
          rating.render();
        }

        if (initValue != undefined) {
          rating.setValue(initValue);
        }

        return rating;
      }
    });
  }
});
