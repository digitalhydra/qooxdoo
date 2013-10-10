/**
 * @require(qx.module.Template)
 */
qx.Bootstrap.define("qx.ui.website.Calendar", {
  extend : qx.ui.website.Widget,

  statics : {
    _templates : {
      controls : "<tr>" +
                   "<td colspan='1'><button class='qx-calendar-prev' title='Previous Month'>&lt;</button></td>" +
                   "<td colspan='5'>{{month}} {{year}}</td>" +
                   "<td colspan='1'><button class='qx-calendar-next' title='Next Month'>&gt;</button></td>" +
                 "</tr>",
      dayRow : "<tr>" +
                 "{{#row}}<td>{{.}}</td>{{/row}}" +
               "</tr>",
      row : "<tr>" +
              "{{#row}}<td class='{{cssClass}}'><button class='qx-calendar-day' value='{{date}}'>{{day}}</button></td>{{/row}}" +
            "</tr>",
      table : "<table><thead>{{{thead}}}</thead><tbody>{{{tbody}}}</tbody></table>"
    },

    _config : {
      monthNames : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      dayNames : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    }
  },


  construct : function(selector, context) {
    this.base(arguments, selector, context);

    this._forEachElementWrapped(function(calendar) {
      calendar.showValue(new Date());
      calendar.addClass("qx-calendar");
    });
  },


  events : {
    /** Fired at each value change */
    "changeValue" : "Date"
  },


  members : {
    render : function() {
      this.showValue(this.getProperty("shownValue"));
      return this;
    },


    setValue : function(value) {
      this.setProperty("value", value);
      this.showValue(value);
      this.emit("changeValue", value);
      return this;
    },


    getValue : function() {
      return this.getProperty("value");
    },


    showValue : function(value) {
      this.setProperty("shownValue", value);

      this._forEachElementWrapped(function(item) {
        item.find(".qx-calendar-prev").offWidget("click", this._prevMonth, item);
        item.find(".qx-calendar-next").offWidget("click", this._nextMonth, item);
        item.find(".qx-calendar-day").offWidget("click", this._selectDay, item);
      }, this);

      this.setHtml(this._getTable(value));

      this._forEachElementWrapped(function(item) {
        item.find(".qx-calendar-prev").onWidget("click", this._prevMonth, item);
        item.find(".qx-calendar-next").onWidget("click", this._nextMonth, item);
        item.find(".qx-calendar-day").onWidget("click", this._selectDay, item);
      }, this);

      return this;
    },

    _prevMonth : function() {
      var shownValue = this.getProperty("shownValue");
      this.showValue(new Date(shownValue.getFullYear(), shownValue.getMonth() - 1));
    },

    _nextMonth : function() {
      var shownValue = this.getProperty("shownValue");
      this.showValue(new Date(shownValue.getFullYear(), shownValue.getMonth() + 1));
    },

    _selectDay : function(e) {
      var day = qxWeb(e.getTarget());
      var newValue = new Date(day.getAttribute("value"));
      this.setValue(newValue);
    },


    _getTable : function(date) {
      var controls = qxWeb.template.render(this.getTemplate("controls"), this._getControlsData(date));
      var dayRow = qxWeb.template.render(this.getTemplate("dayRow"), this._getDayRowData(date));

      var data = {
        thead: controls + dayRow,
        tbody: this._getWeekRows(date)
      };

      return qxWeb.template.render(this.getTemplate("table"), data);
    },


    _getControlsData : function(date) {
      return {
        month: this.getConfig("monthNames")[date.getMonth()],
        year: date.getFullYear()
      };
    },

    _getDayRowData : function(date) {
      return {
        row: this.getConfig("dayNames")
      };
    },


    _getWeekRows : function(date) {
      var weeks = [];
      var startOfWeek = 1;

      var helpDate = new Date(date.getFullYear(), date.getMonth(), 1);

      var firstDayOfWeek = helpDate.getDay();
      var today = new Date();

      helpDate = new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0);
      var nrDaysOfLastMonth = (7 + firstDayOfWeek - startOfWeek) % 7;
      helpDate.setDate(helpDate.getDate() - nrDaysOfLastMonth);

      for (var week=0; week<6; week++) {
        var data = {row: []};

        for (var i=0; i<7; i++) {
          var cssClasses = helpDate.getMonth() !== date.getMonth() ? "othermonth" : "";
          if (this.getProperty("value")) {
            cssClasses += helpDate.toDateString() === this.getProperty("value").toDateString() ? " selected" : "";
          }
          cssClasses += today.toDateString() === helpDate.toDateString() ? " today" : "";

          data.row.push({
            day: helpDate.getDate(),
            date: helpDate.toDateString(),
            cssClass: cssClasses
          });
          helpDate.setDate(helpDate.getDate() + 1);
        }

        weeks.push(qxWeb.template.render(this.getTemplate("row"), data));
      }

      return weeks.join("");
    },

    dispose : function() {
      this._forEachElementWrapped(function(item) {
        item.find(".qx-calendar-prev").offWidget("click", this._prevMonth, item);
        item.find(".qx-calendar-next").offWidget("click", this._nextMonth, item);
        item.find(".qx-calendar-day").offWidget("click", this._selectDay, item);
      }, this);

      this.setHtml("");

      return this.base(arguments);
    }

  },


  defer : function(statics) {
    qxWeb.$attach({
      calendar : function(date) {
        var calendar =  new qx.ui.website.Calendar(this);

        if (date != undefined) {
          calendar.setValue(date);
        }

        return calendar;
      }
    });
  }
});
