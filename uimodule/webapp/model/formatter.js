sap.ui.define([], function () {
	"use strict";
	return {

    dateFormat: (sDate) =>{
      return new Date(sDate.slice(0, 4), sDate.slice(4, 6), sDate.slice(6, 8)).toLocaleDateString();
    }

  };
});
