sap.ui.define([], function () {
  "use strict";
  return {
    /**
     * Formats date from yyyymmdd to dd/mm/yy
     * @function
     * @param {string} sData the date to be formatted
     * @return {string} the formatted date dd/mm/yyyy
     */
    dateStringFormat: (sDate) => {
      return sDate
        ? new Date(
            sDate.slice(0, 4),
            sDate.slice(4, 6),
            sDate.slice(6, 8)
          ).toLocaleDateString()
        : "";
    },

    /**
     * Formats date to local date string
     * @function
     * @param {date} dDate the date to be formatted
     * @return {string} the formatted to locale date string
     */
    dateFormat: (dDate) => {
      return dDate ? dDate.toLocaleDateString() : "";
    },

    /**
     * Number Format shortcut
     * @function
     * @param {number} n the number to be formatted
     * @returns {string} the formatted number
     */
    toLocaleNumber: Intl.NumberFormat().format,

    /**
     * Capitalizes each letter after blank space in a string
     * @function
     * @param {string} str the string to be formatted
     * @return {string} a String With Capital Letters After Blank Space
     */
    formatTitle: (str) => {
      var sReturn = str;
      try {
        sReturn = str.replace(/\w\S*/g, function (txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
      } finally {
        return sReturn;
      }
    },

    /**
     * Convenience method for removing a label.
     *
     * Removes a label with colons and trims it.
     *
     * @function
     * @public
     * @param {string} str the string to be formatted
     * @return {string} labelless string
     */
    removeLabel: (str) => {
      try {
        return /:(.+)/.exec(str)[1].trim();
      } catch (err) {
        return str.trim();
      }
    },

    /**
     * Convenince method for deleting leading zeros
     * @public
     * @param {string} str the string to be formatted
     * @return {string} the string with no leading zeros
     */
    deleteLeadingZeros: (str) => {
      return str ? str.replace(/^0+/, "") : "0";
    },

    /**
     * Convenince method for summing an array
     * @public
     * @param {array} aList the array of objects to be reduced in sum
     * @param {string} sProperty the property name of access
     * @return {number}
     */
    sumList: function (aList, sProperty) {
      return aList.reduce(function (a, b) {
        return a + parseFloat(b[sProperty]);
      }, 0);
    },
  };
});
