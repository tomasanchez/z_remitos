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
        var oViewModel, iOriginalBusyDelay;

        // eslint-disable-next-line no-unused-vars
        oController = this;

        // keeps the search state
        this._aTableSearchState = [];

        // Model used to manipulate control states
        oViewModel = new JSONModel({
          remitosTableTitle: this.getResourceBundle().getText(
            "remitosTableTitle"
          ),
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

        var oTable = this.byId("smartTableCustom");

        // Put down worklist table's original value for busy indicator delay,
        // so it can be restored later on. Busy handling on the table is
        // taken care of by the table itself.
        iOriginalBusyDelay = oTable.getBusyIndicatorDelay();

        // Make sure, busy indication is showing immediately so there is no
        // break after the busy indication for loading the view's meta data is
        // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
        oTable.attachEventOnce("updateFinished", function () {
          // Restore original busy indicator delay for worklist's table
          oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
        });
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
       * Triggered by Download Button
       * @function
       * @public
       */
      onDownload: () => {
        // Obtain table
        var oTable = oController.byId("smartTableCustom");

        // Then items, and for each item download a PDF
        var aItems = oTable.getSelectedItems();
        aItems.forEach((oItem, iDelay) =>
          setTimeout(() => {
            oController._downloadPDF(oItem.getBindingContext().getObject().Entrega);
          }, iDelay * 2000)
        );
      },

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
          .Entrega;
        // Download PDF based on 'Entrega' ID
        oController._downloadPDF(sEntrega);
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

        //Werks Custom Filter
        var oComboBox = oSmtFilter.getControlByKey("Centro");
        var sWerks = oComboBox.getSelectedKey();
        if (sWerks) {
          var newFilter = new Filter("Werks", FilterOperator.EQ, sWerks);
          mBindingParams.filters.push(newFilter);
        }

        //AcNegocio Custom Filter
        var oInput = oSmtFilter.getControlByKey("AcNegocio"),
          sAcNegocio = oInput.getValue();
        if (sAcNegocio) {
          var negocioFilter = new Filter(
            "AcNegocio",
            FilterOperator.EQ,
            sAcNegocio
          );
          mBindingParams.filters.push(negocioFilter);
        }
      },

      /* =========================================================== */
      /* Internal Methods                                            */
      /* =========================================================== */

      /**
       * Downloads a PDF File of a 'Remito'
       * @function
       * @param {string} sEntrega the id of entrega to be fetch
       * @public
       */
      _downloadPDF: (sEntrega) => {
        // The document Type
        var sDocument = "REM";
        // The model from where to obtain the pdf
        var oModel = oController.getModel("relatedDocs");

        // The request Path for printing
        var sPath = `${oModel.sServiceUrl}/PrinterSet(TipoDoc='${sDocument}',Documento='${sEntrega}')/$value`;

        // Open a new window with that path
        var oAttachment = window.open(sPath, "_blank");

        // if no window show warning message
        if (oAttachment == null) {
          MessageBox.warning(oController.readFromI18n("noFileErrorMSG"));
        }
      },

      /**
       * Triggered by the table's 'updateFinished' event: after new table
       * data is available, this handler method updates the table counter.
       * This should only happen if the update was successful, which is
       * why this handler is attached to 'updateFinished' and not to the
       * table's list binding's 'dataReceived' method.
       * @param {sap.ui.base.Event} oEvent the update finished event
       * @public
       */
      onTableUpdateFinished: function (oEvent) {
        // update the remitos's object counter after the table update
        var sTitle,
          oTable = oEvent.getSource(),
          iTotalItems = oEvent.getParameter("total");
        // only update the counter if the length is final and
        // the table is not empty
        if (iTotalItems) {
          sTitle = this.getResourceBundle().getText("remitosTableTitleCount", [
            iTotalItems,
          ]);
        } else {
          sTitle = this.getResourceBundle().getText("remitosTableTitle");
        }
        this.getModel("remitosView").setProperty("/remitosTableTitle", sTitle);
      },
    });
  }
);
