sap.ui.define(
  [
    "com/profertil/Remitos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/PDFViewer",
    "../model/formatter",
  ],
  function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessageBox,
    PDFViewer,
    formatter
  ) {
    "use strict";
    // Bind this shortcut
    var oController;

    return Controller.extend("com.profertil.Remitos.controller.Remitos", {
      /**
       * Formmater JS split-code.
       * @memberOf com.profertil.view.Remitos
       */
      formatter: formatter,

      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      /**
       * Called when the remitos controller is instantiated.
       * @memberOf com.profertil.view.Remitos
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
        this.addHistoryEntry(
          {
            title: this.getResourceBundle().getText("remitosViewTitle"),
            icon: "sap-icon://table-view",
            intent: "#Remitos-display",
          },
          true
        );
      },

      /**
       * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
       * (NOT before the first rendering! onInit() is used for that one!).
       * @memberOf com.profertil.view.Remitos
       */
      //	onBeforeRendering: function() {
      //
      //	},

      /**
       * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
       * This hook is the same one that SAPUI5 controls get after being rendered.
       * @memberOf com.profertil.view.Remitos
       */
      //	onAfterRendering: function() {
      //
      //	},

      /**
       * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
       * @memberOf com.profertil.view.Remitos
       */
      //	onExit: function() {
      //
      //	}

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
        if (
          sap.ushell &&
          sap.ushell.Container &&
          sap.ushell.Container.getService
        ) {
          // The id of 'Entrega'
          var sEntrega = oEvent.getSource().getBindingContext().getObject()
            .Entrega;
          //Cross app navigation service
          sap.ushell.Container.getService(
            "CrossApplicationNavigation"
          ).toExternal({
            target: {
              shellHash: "DocumentosRel-display?&/Documento/REM," + sEntrega,
            },
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
        // The id of 'Entrega'
        var sEntrega = oEvent.getSource().getBindingContext().getObject()
            .Entrega,
          // The document type
          sDocument = "REM";

        // The model from where to obtain the pdf
        var oModel = new sap.ui.model.odata.ODataModel(
          "/sap/opu/odata/sap/ZSV_RELATED_DOCS_SRV"
        );

        // The request Path for printing
        var sPath = `${oModel.sServiceUrl}/PrinterSet(TipoDoc='${sDocument}',Documento='${sEntrega}')/$value`;

        // Open a new window with that path
        var oAttachment = window.open(sPath, "_blank");

        // if no window show warning message
        if (oAttachment == null) {
          MessageBox.warning(oBundle.getText("Error.PopUpBloqued"));
        }

        /* oModel.read(sPath, {
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
      });*/
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
        var sWerks = oComboBox.getSelectedKey();
        if (sWerks) {
          var newFilter = new Filter("Werks", FilterOperator.EQ, sWerks);
          mBindingParams.filters.push(newFilter);
        }
      },
    });
  }
);
