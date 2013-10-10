qx.Bootstrap.define("qx.ui.website.Button", {
  extend : qx.ui.website.Widget,

  construct : function(selector, context) {
    this.base(arguments, selector, context);

    this.forEach(function(button) {
      button = qxWeb(button);

      if (!button.hasClass("qx-button")) {
        button.addClass("qx-button");
      }

      if (button.getChildren("span") == 0) {
        qxWeb.create("<span>").appendTo(button);
      }

      if (button.getChildren("img") == 0) {
        qxWeb.create("<img>").appendTo(button).setStyle("display", "none");
      }
    });
  },


  members : {
    setLabel : function(value) {
      this.getChildren("span").setHtml(value);
      return this;
    },


    getLabel : function() {
      return this.getChildren("span").getHtml();
    },


    setIcon : function(src) {
      var img = this.getChildren("img");
      img.setAttribute("src", src);
      img.setStyle("display", src ? "inline" : "none");

      return this;
    },


    setMenu : function(menu) {
      this.on("click", function(e) {
        menu.placeTo(this, "bottom-left");
        menu.show();
        qxWeb(document).once("click", function() {
          menu.hide();
        });
        e.stopPropagation();
      });
    }
  },


  defer : function() {
    qxWeb.$attach({
      button : function(label, icon) {
        var buttons = new qx.ui.website.Button(this);
        if (label != null) {
          buttons.setLabel(label);
        }
        if (icon != null) {
          buttons.setIcon(icon);
        }

        return buttons;
      }
    });
  }
});
