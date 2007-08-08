/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * The default data cell renderer.
 */
qx.Class.define("qx.ui.table2.cellrenderer.Default",
{
  extend : qx.ui.table2.cellrenderer.Abstract,



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    STYLEFLAG_ALIGN_RIGHT : 1,
    STYLEFLAG_BOLD        : 2,
    STYLEFLAG_ITALIC      : 4
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Whether the alignment should automatically be set according to the cell value.
     * If true numbers will be right-aligned.
     */
    useAutoAlign :
    {
      check : "boolean",
      init : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Determines the styles to apply to the cell
     *
     * @type member
     * @param cellInfo {Object} cellInfo of the cell
     * @return {var} the sum of any of the STYLEFLAGS defined below
     */
    _getStyleFlags : function(cellInfo)
    {
      if (this.getUseAutoAlign())
      {
        if (typeof cellInfo.value == "number") {
          return qx.ui.table2.cellrenderer.Default.STYLEFLAG_ALIGN_RIGHT;
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @param htmlArr {var} TODOC
     * @return {void}
     */
    _getCellStyle : function(cellInfo, htmlArr)
    {
      this.base(arguments, cellInfo, htmlArr);

      var stylesToApply = this._getStyleFlags(cellInfo);

      if (stylesToApply & qx.ui.table2.cellrenderer.Default.STYLEFLAG_ALIGN_RIGHT) {
        htmlArr.push(";text-align:right");
      }

      if (stylesToApply & qx.ui.table2.cellrenderer.Default.STYLEFLAG_BOLD) {
        htmlArr.push(";font-weight:bold");
      }

      if (stylesToApply & qx.ui.table2.cellrenderer.Default.STYLEFLAG_ITALIC) {
        htmlArr.push(";font-style:italic");
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @param htmlArr {var} TODOC
     * @return {void}
     */
    _getContentHtml : function(cellInfo, htmlArr) {
      htmlArr.push(qx.legacy.html.String.escape(this._formatValue(cellInfo)));
    },


    /**
     * Formats a value.
     *
     * @type member
     * @param cellInfo {Map} A map containing the information about the cell to
     *          create. This map has the same structure as in
     *          {@link DataCellRenderer#createDataCell}.
     * @return {String} the formatted value.
     */
    _formatValue : function(cellInfo)
    {
      var value = cellInfo.value;

      if (value == null) {
        return "";
      }

      if (typeof value == "string") {
        return value;
      }
      else if (typeof value == "number")
      {
        if (!qx.ui.table2.cellrenderer.Default._numberFormat)
        {
          qx.ui.table2.cellrenderer.Default._numberFormat = new qx.util.format.NumberFormat();
          qx.ui.table2.cellrenderer.Default._numberFormat.setMaximumFractionDigits(2);
        }

        res = qx.ui.table2.cellrenderer.Default._numberFormat.format(value);
      }
      else if (value instanceof Date)
      {
        res = qx.util.format.DateFormat.getDateInstance().format(value);
      }
      else
      {
        res = value;
      }

      return res;
    }

  }
});
