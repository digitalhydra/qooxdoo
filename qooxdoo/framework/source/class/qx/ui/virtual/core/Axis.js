/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The axis maps virtual screen coordinates to cell indexes. By default all
 * cells have the same size but it is also possible to give specific cells
 * a different size.
 */
qx.Class.define("qx.ui.virtual.core.Axis",
{
  extend : qx.core.Object,

  construct : function(defaultItemSize, cellCount) {
    this.base(arguments);
    
    this.cellCount = cellCount;
    this.defaultItemSize = defaultItemSize;
    
    // sparse array
    this.customSizes = {};
  },
  

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    getDefaultItemSize : function(defaultItemSize) {
      return this.defaultItemSize;
    },    
    
    setDefaultItemSize : function(defaultItemSize) 
    {
      this.defaultItemSize = defaultItemSize;
      this.__ranges = null;
    },
    
    getItemCount : function() {
      return this.cellCount;
    },
    
    setItemCount : function(cellCount)
    {
      this.cellCount = cellCount;
      this.__ranges = null;
    },    
    
    setItemSize : function(cellIndex, size)
    {
      this.customSizes[cellIndex] = size;
      this.__ranges = null;
    },
    
    getItemSize : function(cellIndex)
    {
      // custom size of 0 is not allowed
      return this.customSizes[cellIndex] || this.defaultItemSize;
    },
    
    
    /**
     * Split the the position range into disjunct intervals. Each interval starts
     * with a custom sized cell. Each position is contained in exactly one range.
     * The ranges are sorted according to their start position.
     * 
     * Complexity: O(n log n) (n = number of custom sized cells)
     */
    __getRanges : function()
    {
      if (this.__ranges) {
        return this.__ranges;
      }
      
      var defaultSize = this.defaultItemSize;
      var cellCount = this.cellCount;
      
      var indexes = [];
      for (var key in this.customSizes) {
        indexes.push(parseInt(key));
      }
      if (indexes.length == 0) 
      {
        var ranges = [{
          startIndex: 0,
          firstItemSize: defaultSize,
          rangeStart: 0,
          rangeEnd: cellCount * defaultSize - 1
        }];
        this.__ranges = ranges;
        return ranges;
      }
      
      indexes.sort();
      
      var ranges = [];
      var correctionSum = 0;      
      
      for (var i=0; i<indexes.length; i++) 
      {
        var index = indexes[i];
        var cellSize = this.customSizes[index];
        var rangeStart = index * defaultSize + correctionSum;
        
        correctionSum += cellSize - defaultSize;        
        
        ranges[i] = {
          startIndex: index,
          firstItemSize: cellSize,
          rangeStart: rangeStart
        };
        if (i > 0) {
          ranges[i-1].rangeEnd = rangeStart-1
        }
      }
      
      // fix first range
      if (ranges[0].rangeStart > 0) {
        ranges.unshift({
          startIndex: 0,
          firstItemSize: defaultSize,
          rangeStart: 0,
          rangeEnd: ranges[0].rangeStart-1
        });
      }
      
      // fix last range
      var lastRange = ranges[ranges.length-1];
      var remainingItemsSize = (cellCount - lastRange.startIndex - 1) * defaultSize;
      lastRange.rangeEnd = lastRange.rangeStart + lastRange.firstItemSize + remainingItemsSize - 1;
      
      this.__ranges = ranges;
      return ranges;
    },
        
    
    /**
     * Returns the range, which contains the position
     * 
     * Complexity: O(log n) (n = number of custom sized cells)
     */
    __findRange : function(position)
    {
      var ranges = this.__ranges || this.__getRanges();
      
      var start = 0;
      var end = ranges.length-1;
      
      // binary search in the sorted ranges list
      while (true)
      {
        var pivot = start + ((end - start) >> 1);
        var range = ranges[pivot];
        
        if (range.rangeEnd < position) {
          start = pivot + 1;
        } else if (range.rangeStart > position) {
          end = pivot - 1;
        } else {
          return range;
        }
      }
    },
    
    
    /**
     * Get the cell and the offset into the cell at the given position
     */
    getItemAtPosition : function(position) 
    {
      var range = this.__findRange(position);
      
      var startPos = range.rangeStart;
      var index = range.startIndex;
      var firstItemSize = range.firstItemSize;
      
      if (startPos + firstItemSize > position)
      {
        return {
          index: index,
          offset: position - startPos
        }
      }
      else
      {
        var defaultSize = this.defaultItemSize;
        return {
          index: index + 1 + Math.floor((position - startPos - firstItemSize) / defaultSize),
          offset: (position - startPos - firstItemSize) % defaultSize
        }
      }
    },
    
        
    /**
     * Returns the sum of all cell sizes
     */
    getTotalSize : function()
    {
      var ranges = this.__ranges || this.__getRanges();
      return ranges[ranges.length-1].rangeEnd + 1;
    },
    
    
    /**
     * Get an array of item sizes starting with the item at "startIndex". The
     * sum of all sizes in the returned array is at least "minSizeSum". 
     */
    getItemSizes : function(startIndex, minSizeSum)
    {
      
      var customSizes = this.customSizes;
      var defaultSize = this.defaultItemSize;
      
      var sum = 0;      
      var sizes = [];
      var i=0;
      while (sum < minSizeSum)
      {
        var itemSize = customSizes[startIndex++] || defaultSize;
        sum += itemSize;
        sizes[i++] = itemSize;
      }
      return sizes;
    }
  }
});
