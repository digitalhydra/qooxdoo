/**
 * @require(qx.module.Dataset)
 * @require(qx.module.util.String)
 * @require(qx.module.event.Native)
 */
qx.Bootstrap.define("qx.ui.website.Widget", {
  extend : qxWeb,

  statics : {
    /**
     * Creates a new collection from the given argument. This can either be an
     * HTML string, a single DOM element or an array of elements
     *
     * @attachStatic{qxWeb}
     * @param html {String|Element[]} HTML string or DOM element(s)
     * @return {qxWeb} Collection of elements
     */
    create : function(html) {
      return new qx.ui.website.Widget(qxWeb.create(html));
    },

    /**
     * TODOC
     *
     * @attach {qxWeb}
     * @param type {String} Type of the event to listen for
     * @param listener {Function} Listener callback
     * @param context {Object?} Context the callback function will be executed in.
     * Default: The element on which the listener was registered
     * @return {qxWeb} The collection for chaining
     */
    onWidget : function(type, listener, ctx) {
      var propertyName = this.classname.replace(/\./g, "-") + "-context";
      if (!this.getProperty(propertyName)) {
        this.setProperty(propertyName, ctx);
      }
      var originalCtx = this.getProperty(propertyName);

      if (!this.hasListener(type, listener, originalCtx)) {
        this.on(type, listener, originalCtx);
      }

      return this;
    },

    /**
     * [offWidget description]
     *
     * @attach {qxWeb}
     * @param  {[type]} type     [description]
     * @param  {[type]} listener [description]
     * @param  {[type]} ctx      [description]
     * @return {[type]}          [description]
     */
    offWidget : function(type, listener, ctx) {
      var propertyName = this.classname.replace(/\./g, "-") + "-context";
      var originalCtx = this.getProperty(propertyName);

      this.off(type, listener, originalCtx);

      return this;
    }
  },


  construct : function(selector, context) {
    var col = this.base(arguments, selector, context);
    Array.prototype.push.apply(this, Array.prototype.slice.call(col, 0, col.length));
    this.init();
  },


  members : {

    init : function() {
      this.setAttribute("qx-class", this.classname);
      if (!this.hasClass("qx-widget")) {
        this.addClass("qx-widget");
      }
    },

    setTemplate : function(name, template) {
      return this._setData("templates", name, template);
    },


    setConfig : function(name, config) {
      return this._setData("config", name, config);
    },


    _setData : function(type, name, data) {
      this.forEach(function(item) {
        if (!item[type]) {
          item[type] = {};
        }
        item[type][name] = data;
      });

      return this;
    },


    getTemplate : function(name) {
      return this._getData("templates", name);
    },


    getConfig : function(name) {
      return this._getData("config", name);
    },


    _getData : function(type, name) {
      var storage = this.getProperty(type);
      var item;

      if (storage) {
        item = storage[name];
      }

      if (!item && type == "config") {
        var attribName = "qx" + qxWeb.string.firstUp(type) +
          qxWeb.string.firstUp(name);
        item = this.getData(attribName);
        try {
          item = JSON.parse(item);
        } catch(e) {}
      }

      if (!item && this.constructor["_" + type]) {
        return this.constructor["_" + type][name];
      }

      return item;
    },


    setSelectable : function(value) {
      if (!this[0]) {
        return;
      }
      var contentElement = this.eq(0);
      contentElement.setAttribute("qxSelectable", value ? "on" : "off");
      var userSelect = qx.core.Environment.get("css.userselect");
      if (userSelect) {
        contentElement.setStyle(userSelect, value ? "text" :
          qx.core.Environment.get("css.userselect.none"));
      }
      return this;
    },


    dispose : function() {
      this.removeAttribute("qx-class");
      this.setProperty("config", undefined);
      this.setProperty("templates", undefined);
      this.removeClass("qx-widget");

      return qxWeb.$init(this, qxWeb);
    }
  },

  defer : function(statics) {
    qxWeb.$attach({
      onWidget : statics.onWidget,
      offWidget : statics.offWidget
    });
  }
});
