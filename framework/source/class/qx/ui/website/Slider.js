/**
 * @require(qx.module.event.Mouse)
 * @require(qx.module.Transform)
 */
qx.Bootstrap.define("qx.ui.website.Slider",
{
  extend : qx.ui.website.Widget,

  statics : {
    _config : {
      minimum : 0,
      maximum : 100,
      offset : 0,
      steps : null
    },

    _templates : {
      knob : "<div>"
    }
  },


  construct : function(selector, context) {
    this.base(arguments, selector, context);

    if (this.length === 0) {
      return;
    }

    if (!this.hasListener("click", this._onClick)) {
      this.on("click", this._onClick, this);
      this.setProperty("qx-slider-context", this);
    }

    var doc = qxWeb(document.documentElement);
    if (!doc.hasListener("mouseup", this._onMouseUp)) {
      doc.on("mouseup", this._onMouseUp, this);
    }

    qxWeb(window).on("resize", this._onWindowResize, this);

    this._forEachElement(function(slider) {
      slider = qxWeb(slider).addClass("qx-slider");
      if (slider.getChildren(".qx-slider-knob").length === 0) {
        qx.ui.website.Widget.create(this.getTemplate("knob"))
        .addClass("qx-slider-knob")
        .appendTo(slider);
      }
      slider.getChildren(".qx-slider-knob")
      .setAttributes({
        "draggable": "false",
        "unselectable": "true"
      })
      .on("mousedown", this._onMouseDown, this)
      .on("dragstart", this._onDragStart, this);
    }.bind(this));
  },


  events :
  {
    /** Fired at each value change */
    "changeValue" : "qx.event.Emitter",

    /** Fired with each mouse move event */
   "changePosition" : "qx.event.Emitter"
  },



  members :
  {
    __dragMode : null,
    __pixel : null,


    /**
     * Returns the current value of the slider
     *
     * @return {Integer} slider value
     */
    getValue : function() {
      return this.getProperty("value");
    },

    /**
     * Sets the current value of the slider.
     *
     * @param value {Integer} new value of the slider
     */
    setValue : function(value)
    {
      if (qxWeb.type.get(value) != "Number") {
        throw Error("Please provide a Number value for 'value'!");
      }

      this.setProperty("value", value);

      //TODO value not in steps
      if (this.getConfig("steps").indexOf(value) != -1) {
        this.__valueToPosition(value);
        this.emit("changeValue", value);
      }
    },


    render : function() {
      this._getPixels(true);
    },


    _getHalfKnobWidth : function() {
      var knobWidth = this.getChildren(".qx-slider-knob").getWidth();
      return parseInt(knobWidth / 2, 10);
    },


    _getDragBoundaries : function()
    {
      var offset = this.getConfig("offset");
      return {
        min : this.getOffset().left + offset,
        max : this.getOffset().left + this.getWidth() - offset
      };
    },


    /**
     * Creates a lookup table to get the pixel values for each slider step.
     * And computes the "breakpoint" between two steps in pixel.
     */
    _getPixels : function(refresh)
    {
      if (this.__pixel && !refresh) {
        return this.__pixel;
      }

      var steps = this.getConfig("steps");
      if (!steps) {
        return [];
      }

      var dragBoundaries = this._getDragBoundaries();

      this.__pixel = [];

      // First pixel value is fixed
      this.__pixel.push(dragBoundaries.min);

      var lastIndex = steps.length-1;

      //The width really used by the slider (drag area)
      var usedWidth = this.getWidth() - (this.getConfig("offset") * 2);

      //The width of a single slider step
      var stepWidth = usedWidth/(steps[lastIndex]-steps[0]);

      var stepCount = 0;

      for(var i=1, j=steps.length-1; i<j; i++){
        stepCount = steps[i] - steps[0];
        this.__pixel.push(Math.round(stepCount*stepWidth) + dragBoundaries.min);
      }

      // Last pixel value is fixed
      this.__pixel.push(dragBoundaries.max);

      return this.__pixel;
    },


    /**
    * Returns the nearest existing slider value according to he position of the knob element.
    * @param position {Integer} The current knob position in pixels
    * @return {Integer} The next position to snap to
    */
    __getNearestValue : function(position) {
      var pixels = this._getPixels();
      var currentIndex = 0, before = 0, after = 0;
      for (var i=0, j=pixels.length; i<j; i++) {
        if (position >= pixels[i]) {
          currentIndex = i;
          before = pixels[i];
          after = pixels[i+1] || before;
        } else {
          break;
        }
      }

      currentIndex = Math.abs(position - before) <=  Math.abs(position - after) ? currentIndex : currentIndex + 1;

      return this.getConfig("steps")[currentIndex];
    },


    /**
     * Takes the click position and sets slider value to the nearest step.
     *
     * @param e {qx.event.Emitter} Incoming event object
     */
    _onClick : function(e) {
      this.setValue(this.__getNearestValue(e.getDocumentLeft()));
    },


    /**
     * Listener of mousedown event. Initializes drag or tracking mode.
     *
     * @param e {qx.event.Emitter} Incoming event object
     */
    _onMouseDown : function(e) {
      // this can happen if the user releases the button while dragging outside
      // of the browser viewport
      if (this.__dragMode) {
        return;
      }

      this.__dragMode = true;

      qxWeb(document.documentElement).on("mousemove", this._onMouseMove, this)
      .setStyle("cursor", "pointer");

      e.stopPropagation();
    },


    /**
     * Listener of mouseup event. Used for cleanup of previously
     * initialized modes.
     *
     * @param e {qx.event.Emitter} Incoming event object
     */
    _onMouseUp : function(e)
    {
      if (this.__dragMode === true) {
        // Cleanup status flags
        delete this.__dragMode;

        this.__valueToPosition(this.getValue());

        qxWeb(document.documentElement).off("mousemove", this._onMouseMove, this)
        .setStyle("cursor", null);
      }

      e.stopPropagation();
    },


    /**
     * Listener of mousemove event for the knob. Only used in drag mode.
     *
     * @param e {qx.event.Emitter} Incoming event object
     */
    _onMouseMove : function(e) {
      e.preventDefault();

      if (this.__dragMode) {
        var dragPosition = e.getDocumentLeft();
        var dragBoundaries = this._getDragBoundaries();
        var positionKnob = dragPosition - this.getOffset().left - this._getHalfKnobWidth();

        if (dragPosition >= dragBoundaries.min && dragPosition <= dragBoundaries.max) {
          this.setValue(this.__getNearestValue(dragPosition));
          if (positionKnob > 0) {
            this._setKnobPosition(positionKnob);
            this.emit("changePosition", positionKnob);
          }
        }
      }

      e.stopPropagation();
    },


    _onDragStart : function(e) {
      e.stopPropagation();
      e.preventDefault();
    },


    /**
    * Applies the horizontal position
    * @param x {Integer} the position to move to
    */
    _setKnobPosition : function(x) {
      var knob = this.getChildren(".qx-slider-knob");
      if (qxWeb.env.get("css.transform")) {
        knob.translate([x + "px", 0, 0]);
      } else {
        knob.setStyle("left", x + "px");
      }
    },


    /**
     * Listener for window resize events. This listener method resets the
     * calculated values which are used to position the slider knob.
     */
    _onWindowResize : function()
    {
      var value = this.getProperty("value");
      this._getPixels(true);
      this.__valueToPosition(value);
    },


    /**
     * Positions the slider knob to the given value and fires the "changePosition"
     * event with the current position as integer.
     *
     * @param value {Integer} slider step value
     */
    __valueToPosition : function(value)
    {
      // Get the pixel value of the current step value
      var valueToPixel = this._getPixels()[this.getConfig("steps").indexOf(value)];

      // relative position is necessary here
      var position = valueToPixel - this.getOffset().left - this._getHalfKnobWidth();
      this._setKnobPosition(position);

      this.emit("changePosition", position);
    },


    dispose : function()
    {
      var ctx = this.getProperty("qx-slider-context");
      ctx.off("click", ctx._onClick, ctx);

      ctx.getChildren(".qx-slider-knob").off("mousedown", ctx._onMouseDown, ctx);
      qxWeb(document.documentElement).off("mouseup", ctx._onMouseUp, ctx);

      qxWeb(window).off("resize", ctx._onWindowResize, ctx);
    }
  },


  // Make the slider widget available as a qxWeb module
  defer : function(statics) {
    qxWeb.$attach({
      slider : function(value, steps) {
        var slider = new qx.ui.website.Slider(this);
        if (typeof steps !== "undefined") {
          slider.setConfig("steps", steps);
        }
        if (typeof value !== "undefined") {
          slider.setValue(value);
        }

        return slider;
      }
    });
  }
});
