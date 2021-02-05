sap.ui.define([
  "com/profertil/Remitos/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "../model/formatter",
], function(Controller, JSONModel, formatter) {
  "use strict";
  var oController;

  return Controller.extend("com.profertil.Remitos.controller.Remitos", {

      formatter: formatter,

    /* =========================================================== */
		/* lifecycle methods                                           */
    /* =========================================================== */

    /**
		 * Called when the remitos controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var oViewModel,
			// eslint-disable-next-line no-unused-vars
				iOriginalBusyDelay;

			// eslint-disable-next-line no-unused-vars
			oController = this;

			// Put down remitos table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
	    //	iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				showStatus: true,
				tableBusyDelay: 0,
			});
			this.setModel(oViewModel, "remitosView");


			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
		//	oTable.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for remitos's table
		//		oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
  //		});

			// Add the remitos page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("remitosViewTitle"),
				icon: "sap-icon://table-view",
				intent: "#Remitos-display"
			}, true);

    },

    onPress: function (oEvent) {
      if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
        var item = oEvent.getParameter("listItem").getBindingContext().getProperty("item");
        sap.ushell.Container.getService("CrossApplicationNavigation").toExternal({
          target: {
            shellHash: "DocumentosRel-display?&/Documento/REM," + item
          }
        });
      }
    }



  });


});
