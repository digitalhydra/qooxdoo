/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/**
 * This is the main application class of your custom application "domains"
 *
 * @asset(domains/*)
 * @require(qx.ui.website.Button)
 * @require(qx.module.Placement)
 * @require(qx.module.Template)
 * @require(qx.ui.website.Rating)
 * @require(qx.ui.website.Slider)
 * @require(qx.module.util.Type)
 * @require(qx.ui.website.Calendar)
 */
qx.Class.define("domains.Application",
{
  extend : qx.application.Inline,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @lint ignoreDeprecated(alert)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Website widget
      var root = document.body;
      var arrow = "down.gif";

      // Menus
      var menu = q("#menu").addClass("qx-menu").appendTo(root).hide();
      menu.getChildren().on("click", function() {
        console.log("Menu click on", this.getHtml());
      });

      // toolbar
      var toolbar = q("#toolbar").addClass("qx-toolbar");

      // buttons
      toolbar.getChildren().button().eq(0).setMenu(menu);
      toolbar.getChildren(".qx-menu-button").setIcon(arrow); // TODO use ▾

      toolbar.getChildren().on("click", function() {
        console.log("Click on", this.getLabel());
      });


      // disabled
      var disabledCollection = q("#toolbar").find("[disabled]");
      disabledCollection.setEnabled(false);


      // // table stuff
      // var data = [
      //   {name: "abc", type: "bcd", kind: "def", status: "efg"},
      //   {name: "cbc", type: "bcd", kind: "def", status: "efg"},
      //   {name: "bbc", type: "bcd", kind: "def", status: "efg"},
      //   {name: "123", type: "234", kind: "345", status: "456"}
      // ];
      // 
      // var template = q("#domains tbody").getHtml();
      // q("#domains tbody").getChildren().remove();
      // for (var i = 0; i < data.length; i++) {
      //   var html = q.template.render(template, data[i]);
      //   q.create(html).appendTo("#domains tbody");
      // }
      // 
      // // sorting
      // var asc = true;
      // q("#domain-names").on("click", function() {
      //   asc = !asc;
      //   this.getSiblings().setHtml(asc ? "↓" : "↑");
      //   q("#domains tbody").getChildren().sort(function(a, b) {
      //     var txtA = q(a).getChildren()[1].textContent;
      //     var txtB = q(b).getChildren()[1].textContent
      //     return txtA === txtB ? 0 : asc ? txtA > txtB : txtA < txtB;
      //   }).appendTo("#domains tbody");
      // });
      // 
      // // checkbox
      // q("thead").find("input").on("change", function(e) {
      //   q("tbody").find("input").setAttribute("checked", e.target.checked);
      // });
      // 
      // q("#domains").find("[type=checkbox]").on("change", function(e) {
      //   var checked = false;
      //   q("#domains").find("[type=checkbox]").forEach(function(item) {
      //     checked = checked || q(item).getAttribute("checked");
      //   });
      //   disabledCollection.setEnabled(checked);
      // });


      // rating
      q("#rating").rating().on("changeValue", function(value) {
        console.log("Rating:", value);
      });
      q("#rating-cloud").rating(2, "☁", 10);
      q("#rating-heart").rating(3, "❤").getChildren().addClass("qx-rating-heart");
      q("#rating-skull").rating().getChildren().addClass("qx-rating-skull");

      // slider
      q("#slider").setStyle("display", "block");
      q("#slider").slider(30, [10,20,30,40]).setConfig("offset", 100).render();


      q("#date").calendar(new Date(2013, 8, 3)).on("changeValue", function(e) {
        console.log("New Date:" + e);
      });

      q("#date2").calendar().setTemplate("dayRow", q("#dayRow").getHtml()).render();

      q("#date3").calendar();



      // TADA!!!
      toolbar.setStyle("display", "block");
      q("#domains").setStyle("display", "table");
    }
  }
});
