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
      step : 1
    },

    _templates : {
      knobContent : "{{value}}"
    }
  },

  construct : function(selector, context) {
    this.base(arguments, selector, context);
  },

  events :
  {
    /** Fired at each value change */
    "changeValue" : "Number",

    /** Fired with each mouse move event */
    "changePosition" : "Number"
  },


  members :
  {
    __dragMode : null,


    init : function() {
      this.base(arguments);

      if (this.length === 0) {
        return;
      }

      this.addClass("qx-slider");

      this._forEachElementWrapped(function(slider) {
        slider.onWidget("click", slider._onClick, slider);
        qxWeb(document.documentElement).onWidget("mouseup", slider._onMouseUp, slider);
        qxWeb(window).onWidget("resize", slider._onWindowResize, slider);

        if (slider.getChildren(".qx-slider-knob").length === 0) {
          slider.append(qx.ui.website.Widget.create("<button>")
          .addClass("qx-slider-knob"));
        }

        slider.getChildren(".qx-slider-knob")
        .setAttributes({
          "draggable": "false",
          "unselectable": "true"
        })
        .setHtml(slider._getKnobContent())
        .onWidget("mousedown", slider._onMouseDown, slider)
        .onWidget("dragstart", slider._onDragStart, slider);
      });
    },


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

      var step = this.getConfig("step");
      if (!qx.Bootstrap.isArray(step)) {
        var min = this.getConfig("minimum");
        var max = this.getConfig("maximum");
        if (value < min) {
          value = min;
        }
        if (value > max) {
          value = max;
        }
        if (qx.Bootstrap.getClass(step) == "Number") {
          value = Math.round(value / step) * step;
        }
      }

      this.setProperty("value", value);

      if (!qx.Bootstrap.isArray(step) || step.indexOf(value) != -1) {
        this.__valueToPosition(value);
        this.getChildren(".qx-slider-knob").setHtml(this._getKnobContent())
        this.emit("changeValue", value);
      }

      return this;
    },


    render : function() {
      var step = this.getConfig("step");
      if (qx.Bootstrap.isArray(step)) {
        this._getPixels(true);
        if (step.indexOf(this.getValue()) == -1) {
          this.setValue(step[0]);
        }
      } else if (qx.Bootstrap.getClass(step) == "Number") {
        this.setProperty("stepsToPixels", null);
        this.setValue(Math.round(this.getValue() / step) * step);
      } else {
        this.setProperty("stepsToPixels", null);
        this.setValue(this.getValue());
      }
      this.getChildren(".qx-slider-knob").setHtml(this._getKnobContent());

      return this;
    },


    _getKnobContent : function() {
      return qxWeb.template.render(
        this.getTemplate("knobContent"), {value: this.getValue()}
      );
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
      if (this.getProperty("stepsToPixels") && !refresh) {
        return this.getProperty("stepsToPixels");
      }

      var step = this.getConfig("step");
      if (!qx.Bootstrap.isArray(step)) {
        this.setProperty("stepsToPixels", null);
        return [];
      }

      var dragBoundaries = this._getDragBoundaries();
      var pixel = [];

      // First pixel value is fixed
      pixel.push(dragBoundaries.min);

      var lastIndex = step.length-1;

      //The width really used by the slider (drag area)
      var usedWidth = this.getWidth() - (this.getConfig("offset") * 2);

      //The width of a single slider step
      var stepWidth = usedWidth/(step[lastIndex] - step[0]);

      var stepCount = 0;

      for(var i=1, j=step.length-1; i<j; i++){
        stepCount = step[i] - step[0];
        pixel.push(Math.round(stepCount*stepWidth) + dragBoundaries.min);
      }

      // Last pixel value is fixed
      pixel.push(dragBoundaries.max);

      this.setProperty("stepsToPixels", pixel);
      return pixel;
    },


    /**
    * Returns the nearest existing slider value according to he position of the knob element.
    * @param position {Integer} The current knob position in pixels
    * @return {Integer} The next position to snap to
    */
    __getNearestValue : function(position) {
      var pixels = this._getPixels();
      if (pixels.length === 0) {

        var dragBoundaries = this._getDragBoundaries();
        var availableWidth = dragBoundaries.max - dragBoundaries.min;
        var relativePosition = position - dragBoundaries.min;
        var fraction = relativePosition / availableWidth;
        var min = this.getConfig("minimum");
        var max = this.getConfig("maximum");
        var result = (max - min) * fraction + min;
        if (result < min) {
          result = min;
        }
        if (result > max) {
          result = max;
        }
        var step = this.getConfig("step");
        if (qx.Bootstrap.getClass(step) == "Number") {
          result = Math.round(result / step) * step;
        }
        return result;
      }

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

      return this.getConfig("step")[currentIndex];
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

      qxWeb(document.documentElement).onWidget("mousemove", this._onMouseMove, this)
      .setStyle("cursor", "pointer");

      e.stopPropagation();
    },


    /**
     * Listener of mouseup event. Used for cleanup of previously
     * initialized modes.
     *
     * @param e {qx.event.Emitter} Incoming event object
     */
    _onMouseUp : function(e) {
      if (this.__dragMode === true) {
        // Cleanup status flags
        delete this.__dragMode;

        this.__valueToPosition(this.getValue());

        qxWeb(document.documentElement).offWidget("mousemove", this._onMouseMove, this)
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
    _onWindowResize : function() {
      var value = this.getProperty("value");
      if (qx.Bootstrap.isArray(this.getConfig("step"))) {
        this._getPixels(true);
      }
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
      var pixels = this._getPixels();
      var valueToPixel;
      if (pixels.length > 0) {
        // Get the pixel value of the current step value
        valueToPixel = pixels[this.getConfig("step").indexOf(value)];
      } else {
        var dragBoundaries = this._getDragBoundaries();
        var availableWidth = dragBoundaries.max - dragBoundaries.min;
        var range = this.getConfig("maximum") - this.getConfig("minimum");
        var fraction = (value - this.getConfig("minimum")) / range;
        valueToPixel = (availableWidth * fraction) + dragBoundaries.min;
      }

      // relative position is necessary here
      var position = valueToPixel - this.getOffset().left - this._getHalfKnobWidth();
      this._setKnobPosition(position);

      this.emit("changePosition", position);
    },


    dispose : function()
    {
      this._forEachElementWrapped(function(slider) {
        slider.offWidget("click", slider._onClick, slider);
        slider.getChildren(".qx-slider-knob")
        .offWidget("mousedown", slider._onMouseDown, slider)
        .offWidget("dragstart", slider._onDragStart, slider);

        qxWeb(document.documentElement).offWidget("mouseup", slider._onMouseUp, slider);
        qxWeb(window).offWidget("resize", slider._onWindowResize, slider);
      });

      this.removeClass("qx-slider");
      this.setHtml("");

      return this.base(arguments);
    }
  },


  // Make the slider widget available as a qxWeb module
  defer : function(statics) {
    qxWeb.$attach({
      slider : function(value, step) {
        var slider = new qx.ui.website.Slider(this);
        if (typeof step !== "undefined") {
          slider.setConfig("step", step);
        }
        if (typeof value !== "undefined") {
          slider.setValue(value);
        } else {
          slider.setValue(slider.getConfig("minimum"));
        }

        return slider;
      }
    });
  }
});
