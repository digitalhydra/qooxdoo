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

    this._forEachElementWrapped(function(rating) {
      for (var i = 0; i < this.getConfig("length"); i++) {
        q.create("<span>" + this.getConfig("symbol") + "</span>").appendTo(rating);
      }

      rating.getChildren("span")
        .addClasses(["qx-rating", "qx-rating-off"])
        .onWidget("click", this.__onClick, rating);
    }.bind(this));

  },


  events : {
    /** Fired at each value change */
    "changeValue" : "Number"
  },


  members : {
    setValue : function(value) {
      this._forEachElementWrapped(function(rating) {
        var children = rating.getChildren("span");
        children.removeClass("qx-rating-off");
        children.slice(value, children.length).addClass("qx-rating-off");
        rating.emit("changeValue", rating.getValue());
      });
      return this;
    },


    getValue : function() {
      return this.eq(0).getChildren("span").not(".qx-rating-off").length;
    },


    render : function() {
      var length = this.getConfig("length");
      this.forEach(function(el) {
        el = q(el);
        var children = el.getChildren();
        children.setHtml(this.getConfig("symbol"));
        var diff = length - children.length;
        if (diff > 0) {
          for (var i = 0; i < diff; i++) {
            children.getLast().clone(true).appendTo(el);
          }
        } else {
          for (var i = 0; i < Math.abs(diff); i++) {
            el.getChildren().getLast().remove();
          }
        }
      }.bind(this));
      return this;
    },


    __onClick : function(e) {
      var parents = q(e.getTarget()).getParents();
      this.setValue(parents.getChildren().indexOf(e.getTarget()) + 1);
    },

    dispose : function() {
      this._forEachElementWrapped(function(rating) {
        rating.getChildren("span").offWidget("click", rating.__onClick, rating);
      });
      this.setHtml("");

      return this.base(arguments);
    }
  },


  defer : function(statics) {
    qxWeb.$attach({
      rating : function(initValue, symbol, length) {
        var rating =  new qx.ui.website.Rating(this);

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
