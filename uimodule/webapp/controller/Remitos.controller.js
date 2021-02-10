sap.ui.define([
  "com/profertil/Remitos/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageBox",
  "sap/m/PDFViewer",
  "../model/formatter",
], function(Controller, JSONModel, Filter, FilterOperator, MessageBox, PDFViewer, formatter) {
  "use strict";
  // Bind this shortcut
  var oController,
      oDocumentsModel;

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

    onAfterRendering: () => {
      // The Documents Model from where request print options
      oDocumentsModel = oController.getModel("relatedDocs");
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
    onDisplayEntrega: function (oEvent) {
      // If shell
      if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
        // The id of 'Entrega'
        var sEntrega = oEvent.getSource().getText();

        //Cross app navigation service
        sap.ushell.Container.getService("CrossApplicationNavigation").toExternal({
          target: {
            shellHash: "DocumentosRel-display?&/Documento/REM," + sEntrega
          }
        });
      }
    },

    /**
     * File downloader handler
     * @function
     * @param {sap.ui.base.Event} oEvent the press event on Xlbnr field
     * @public
     */
    onDisplayXlbnr: (oEvent) => {
      // The id of 'Xblnr'
      var sXblnr = oEvent.getSource().getBindingContext().getObject().Entrega;

      // The request Path
       var sPath = `${oDocumentsModel.createKey("/PrinterSet", {
            TipoDoc: "REM",
            Documento: sXblnr
          })}/$value`;

      // The model from where to obtain the pdf
      var oModel =new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSV_RELATED_DOCS_SRV");

      oModel.read(sPath, {
          success: (oData, oResponse) => {
            var oFile = oResponse.requestUri;
            oFile ?
              window.open(oFile)
            : MessageBox.error(oController.readFromI18n("noFileMSG"));
          },
          error: () => {
            // Server error throw error msg 2
            MessageBox.error(oController.readFromI18n("noFileErrorMSG"));
          }
      });
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
			  var newFilter = new Filter("Werks", FilterOperator.EQ, sWerks);
				mBindingParams.filters.push(newFilter);
			}
		}

  });
});
