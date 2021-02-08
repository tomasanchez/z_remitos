sap.ui.define([
  "com/profertil/Remitos/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
  "../model/formatter",
], function(Controller, JSONModel, Filter, FilterOperator, formatter) {
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
			var oViewModel;

			// eslint-disable-next-line no-unused-vars
      oController = this;

			// keeps the search state
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				showStatus: true,
				tableBusyDelay: 0,
			});
			this.setModel(oViewModel, "remitosView");

			// Add the remitos page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("remitosViewTitle"),
				icon: "sap-icon://table-view",
				intent: "#Remitos-display"
			}, true);

    },

    /* =========================================================== */
		/* event handlers                                              */
    /* =========================================================== */

    /**
		 * Cross Application Navigation
		 * @function
		 * @param {sap.ui.base.Event} oEvent the event of link press
		 * @public
		 */
    onPress: function (oEvent) {
      if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
        var sRemitoID = oEvent.getSource().getText();
        //var item = oEvent.getParameter("listItem").getBindingContext().getProperty("item");
        sap.ushell.Container.getService("CrossApplicationNavigation").toExternal({
          target: {
            shellHash: "DocumentosRel-display?&/Documento/REM," + sRemitoID
          }
        });
      }
    },

    /**
		 * Custom Filters Addition
		 * @function
		 * @param {sap.ui.base.Event} oEvent the event of rebinding the table
		 * @public
		 */
    onBeforeRebindTable: function (oEvent) {
			var mBindingParams = oEvent.getParameter("bindingParams");
			var oSmtFilter = this.getView().byId("filterbar");
			var oComboBox = oSmtFilter.getControlByKey("Centro");
      var sWerks    = oComboBox.getSelectedKey();
      if (sWerks) {
			  var newFilter = new Filter("Centro", FilterOperator.EQ, sWerks);
				mBindingParams.filters.push(newFilter);
			}
		}

  });
});
