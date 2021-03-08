/**
 * Remitos Controller.
 *
 * Methods of Remitos View.
 *
 * @file This files describes Remitos View controller.
 * @author Tomas A. Sanchez
 * @since 02.23.2021
 */
/* eslint-disable no-warning-comments */
sap.ui.define(
  [
    "com/profertil/Remitos/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "../model/formatter",
  ],
  function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessageBox,
    ValueHelpDialog,
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
          showDownload: false,
          showSelectDownloads: true,
          tableSelectionMode: "None",
          dToday: new Date(),
          dLastWeek: oController._getLastWeek(),
          tableBusyDelay: 0,
          isAdmin: oController._isAdmin(),
          isComercial: oController._isComercial(),
          notInComercial: !oController._isComercial(),
          ignoreFieldsFromPerso: oController._getIgnoreFields(),
          entitySet: oController._getEntitySetName(),
          total: 0,
        });
        this.setModel(oViewModel, "remitosView");

        // Add the remitos page to the flp routing history
        this.addHistoryEntry(
          {
            title: this.getResourceBundle().getText("remitosViewTitle"),
            icon: "sap-icon://table-view",
            intent: `#Remitos-${oController._isAdmin() ? "admin" : "display"}`,
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
      // onBeforeRendering: function () {
      // },

      /**
       * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
       * This hook is the same one that SAPUI5 controls get after being rendered.
       * @memberOf com.profertil.view.Remitos
       */
      //onAfterRendering: function () {
      //},

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
       * Event handler called when value help is pressed.
       *
       * Opens corresponding mobile or desktop Value Help.
       * @function
       * @public
       * @param {sap.ui.base.Event} oEvent the press event
       */
      onVHPKunag: function (oEvent) {
        // oInput shortcut
        oController._oInputKunag = oEvent.getSource();
        oController._oValueHelpDialog = oController._createValueHelp(
          "Clientes",
          "Cliente",
          "ClienteTexto",
          oController.onKunagSelected
        );
        oController.getView().addDependent(oController._oValueHelpDialog);
        oController._setVHKunagTable();
        oController._oValueHelpDialog.open();
      },

      /**
       * Triggered by ok in value help.
       *
       * Sets kunag input
       * @param {sap.ui.base.Event} oEvent the ok value help press.
       */
      onKunagSelected: function (oEvent) {
        var oToken = oEvent.getParameter("tokens")[0];
        oController._oInputKunag.setSelectedKey(oToken.getKey());
        oController._oInputKunag.setValue(
          `${oToken.getText()} (${oToken.getKey()})`
        );
        oController._oValueHelpDialog.close();
      },

      /**
       * Triggered by Group button press.
       *
       * Opens Group View Settings Dialog.
       *
       * @function
       * @public
       */
      onGroup: () => {
        oController.openFragment(
          // Fragment name must be in /view/fragments/<name> and controller /controller/fragments/<name>
          "GroupOptions",
          // Model to be set,
          null,
          // Always update model when openning
          true,
          // Callback function
          undefined,
          // Data passed,
          oController.byId("smartTableCustom")
        );
      },

      /**
       * Triggered by Footer Main action.
       * Enables selection in table and download action.
       * @function
       * @param {sap.ui.base.Event} oEvent the button press event
       * @param {boolean} bActive the active state
       * @public
       */
      onSelectDownloads: (_oEvent, bActive = true) => {
        oController._toggleTableSelection(bActive);
        oController._toggleDownloadButtons(bActive);
      },

      /**
       * Triggered by Footer Main action.
       * Enables selection in table and download action.
       * @function
       * @param {sap.ui.base.Event} oEvent the button press event
       * @public
       */
      // eslint-disable-next-line no-unused-vars
      onCancelDownloads: (_oEvent) => {
        oController.onSelectDownloads(null, false);
      },

      /**
       * Triggered by Download Button
       * @function
       * @param {sap.ui.base.Event} oEvent the button press event
       * @public
       */
      // eslint-disable-next-line no-unused-vars
      onDownload: (_oEvent) => {
        // Obtain table
        var oTable = oController.byId("smartTableCustom");

        // Then items, and for each item download a PDF
        var aItems = oTable.getSelectedItems();
        aItems.forEach((oItem, iDelay) =>
          setTimeout(() => {
            oController._downloadPDF(
              oItem.getBindingContext().getObject().Entrega
            );
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
       * Shows Quality Certificate.
       * @function
       * @param {sap.ui.base.Event} oEvent the press event on Quality Certificate field
       * @public
       */
      onDisplayCertificado: (oEvent) => {
        // Number of certificates.
        var sCertificado = oEvent.getSource().getBindingContext().getObject()
          .Certificado;

        // TODO: oController._downloadPDF(sCertificado, 'To be defined');
        MessageBox.warning(`Certificado #${sCertificado} no disponible`);
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
          var oNegocioFilter = new Filter(
            "AcNegocio",
            FilterOperator.EQ,
            sAcNegocio
          );
          mBindingParams.filters.push(oNegocioFilter);
        }

        //Kunag Custom Filter
        oInput = oSmtFilter.getControlByKey("Kunag");
        var sKunag = oInput.getValue();
        if (sAcNegocio && oController._isAdmin()) {
          var oKunagFilter = new Filter("Kunag", FilterOperator.EQ, sKunag);
          mBindingParams.filters.push(oKunagFilter);
        }

        //Only in comercial filters
        if (oController._isComercial()) {
          oInput = oSmtFilter.getControlByKey("Matnr");
          var sMatnr = oInput.getValue();
          if (sMatnr && oController._isAdmin()) {
            var oMatnrFilter = new Filter("Matnr", FilterOperator.BT, sMatnr);
            mBindingParams.filters.push(oMatnrFilter);
          }
        }
      },

      /* =========================================================== */
      /* Internal Methods                                            */
      /* =========================================================== */

      /**
       * Enables or disables multi-selection in the table.
       * @function
       * @private
       * @param {boolean} bActive active select mode ?
       */
      _toggleTableSelection: (bActive = false) => {
        var oViewModel = oController.getModel("remitosView");
        oViewModel.setProperty(
          "/tableSelectionMode",
          bActive ? "MultiSelect" : "None"
        );
      },

      /**
       * Enables or disable visibility of buttons by changing model property.
       * @function
       * @private
       * @param {boolean} bActive active select mode ?
       */
      _toggleDownloadButtons: (bActive = false) => {
        var oViewModel = oController.getModel("remitosView");
        oViewModel.setProperty("/showDownload", bActive);
        oViewModel.setProperty("/showSelectDownloads", !bActive);
      },

      /**
       * Downloads a PDF File of a 'Remito'
       * @function
       * @param {string} sEntrega the id of entrega to be fetch
       * @param {string} sDocument the document type, default REM
       * @public
       */
      _downloadPDF: (sEntrega, sDocument = "REM") => {
        // The model from where to obtain the pdf
        var oModel = oController.getModel("relatedDocs"),
          sServiceUrl = oModel.sServiceUrl;

        // TODO: fix this, for some reason in
        // launchpad sServiceUrl does not contain the complete service url
        // so the service url is obtained from default model
        var sSource = oController
          .getModel()
          // Curt the service url
          .sServiceUrl.substr(
            0,
            // from start to when it finds odata path, as it should be 'relatedDocs' odata url
            oController.getModel().sServiceUrl.indexOf("/sap/opu/odata")
          );

        // The request Path for printing
        var sPath = `${sSource}${sServiceUrl}/PrinterSet(TipoDoc='${sDocument}',Documento='${sEntrega}')/$value`;

        // Open a new window with that path
        // var oAttachment = window.open(sPath, "_blank");

        sap.ui.Device.system.phone
          ? sap.m.URLHelper.redirect(sPath, true)
          : sap.m.URLHelper.redirect(sPath);

        // if no window show warning message
        /* if (oAttachment == null) {
            MessageBox.warning(oController.readFromI18n("noFileErrorMSG"));
          } */
      },

      /**
       * Creates a default date select options
       * @function
       * @private
       * @return {sap.ui.comp.smartfilterbar.SelectOption} the default date select options
       */
      _getDateSelectOptions: () => {
        var oSelectOptions = new sap.ui.comp.smartfilterbar.SelectOption();
        oSelectOptions.high = new Date();
        oSelectOptions.low = oController._getLastWeek();
        return oSelectOptions;
      },

      /**
       * Convenience method for creating a date from last week
       * @function
       * @private
       * @param {date} dCurrentDate the current date from where to obtain last week
       * @return {Date} the last week date
       */
      _getLastWeek: (dCurrentDate = new Date()) => {
        const iDays = 7,
          iHours = 24,
          iMinutes = 60,
          iSeconds = 60,
          iMiliSeconds = 1000;

        return new Date(
          dCurrentDate.getTime() -
            iDays * iHours * iMinutes * iSeconds * iMiliSeconds
        ).setHours(0, 0, 0, 0);
      },

      /**
       * Gets Set Name.
       *
       * When comercial retrieves ComercialSet, when not RemitosSet.
       *
       * @function
       * @private
       * @return {string} the entity set name.
       */
      _getEntitySetName: function () {
        return oController._isComercial() ? "ComercialSet" : "RemitosSet";
      },

      /**
       * Gets ignore fields from personification.
       *
       * Changes ignore fields according to if it is comercial or not.
       *
       * @function
       * @private
       * @return {string} the ignore fields concatenated by ','
       */
      _getIgnoreFields: function () {
        var sDefault = "WerksName1,Bztxt,Posnr",
          sComercial = ",Bzirk,Certificado";
        return oController._isComercial() ? sDefault + sComercial : sDefault;
      },

      /**
       * Determines if app is in admin mode.
       *
       * Obtains url and checks that is not normal display.
       *
       * @function
       * @private
       * @returns {boolean} if current action is not display
       */
      _isAdmin: function () {
        return window.location.href.toLowerCase().includes("-admin");
      },

      /**
       * Determines if app is in Comercial mode.
       *
       * Obtains url and checks if display is comercial.
       *
       * @function
       * @private
       * @returns {boolean} if current action is comercial
       */
      _isComercial: function () {
        return window.location.href.toLowerCase().includes("-comercial");
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
        /**
         * Convenience function.
         *
         * Determines if is a GroupHeaderList Item or not
         *
         * @function
         * @private
         * @param {object} oItem a Table item
         * @returns {boolean} if is a GroupHeader
         */
        const isGroupHeader = (oItem) => {
          return oItem instanceof sap.m.GroupHeaderListItem;
        };

        // The sap.m.Table
        var oTable = oEvent.getSource(),
          // All table items
          aItems = oTable.getItems(),
          // Entites objects
          aEntities = aItems
            // Filter Group Headers
            .filter((oItem) => !isGroupHeader(oItem))
            // Retrieve entity
            .map((oItem) => oItem.getBindingContext().getObject()),
          // All Group Headers Items
          aGroupHeaders = aItems.filter((oItem) => isGroupHeader(oItem));

        // The current sort property that bindings are ordered by.
        var sProperty = oController._getSortProperty(oTable);

        // Count total
        oController._adjustTotalCounter(aEntities);

        // Set titles for all headers
        if (aGroupHeaders.length > 0)
          oController._adjustGroupHeaders(aGroupHeaders, aEntities, sProperty);
      },

      /**
       * Convenience Method for obtaining sort property.
       *
       * Obtains current ordered by property in table.
       *
       * @function
       * @private
       * @param {sap.m.Table} oTable the table from where obtain sort property
       * @returns {string} the ordered by property
       */
      _getSortProperty: (oTable) => {
        var sSortParams = oTable.getBinding("items").sSortParams;
        return sSortParams
          ? sSortParams.replace("$orderby=", "").replace(/%(.*)/g, "")
          : undefined;
      },

      /**
       *  Sets total counter.
       *
       *  Obtains total tns and sets its property in view model.
       * @function
       * @private
       * @param {array} aEntities the array of conext's objects
       */
      _adjustTotalCounter: function (aEntities) {
        var iTns = parseFloat(oController._getTotalTns(aEntities).toFixed(2)),
          oViewModel = oController.getModel("remitosView");
        oViewModel.setProperty("/total", iTns);
      },

      /**
       * Convenience method for setting Group Header Titles.
       *
       * Sets group header titles with total.
       *
       * @param {array} aGroupHeaders the array of all Group Headers
       * @param {array} aEntities the array of all entities entries
       * @param {string} sProperty the current ordered by property
       */
      _adjustGroupHeaders: function (aGroupHeaders, aEntities = [], sProperty) {
        aGroupHeaders.forEach((oGroupHeader) => {
          // Current Group
          var sGroupValue = oController._obtainGroupValue(oGroupHeader),
            // Entities in current group
            aGroupEntities = aEntities.filter(
              (oEntity) => oEntity[sProperty] === sGroupValue
            );

          var iSubTotal = oController._getTotalTns(aGroupEntities).toFixed(2);

          oGroupHeader.setTitle(
            `${sGroupValue} - Subtotal: ${oController.formatter.toLocaleNumber(
              iSubTotal
            )} tns`
          );
        });
      },

      /**
       * Obtains Group Property Value
       *
       * @function
       * @private
       * @param {sap.m.GroupHeaderListItem} oGroupHeader the group header item
       * @returns {string} the title value
       */
      _obtainGroupValue: function (oGroupHeader) {
        var sTitle = oGroupHeader.getTitle(),
          iIndex = sTitle.indexOf("-"),
          sValue = iIndex > 0 ? sTitle.substr(0, iIndex) : sTitle;
        return oController.formatter.removeLabel(sValue);
      },

      /**
       * @function
       * @private
       * @param {array} aEntities the object entities of Remitos
       * @return {number}
       */
      _getTotalTns: function (aEntities = []) {
        return oController.formatter.sumList(aEntities, "Lfimg");
      },

      /**
       * Creates a new ValueHelp Dialog.
       *
       * Returns a value help corresponding to device system.
       *
       * @function
       * @private
       * @param {string} sTitle the Value Help Title to be displayed
       * @param {string} sKey the Input Key value.
       * @param {string} sDescriptionKey the description text value.
       * @param {function} onConfirm the confirm function.
       * @return {sap.ui.comp.valuehelpdialog.ValueHelpDialog} the value help dialog
       */
      _createValueHelp: function (sTitle, sKey, sDescriptionKey, onConfirm) {
        return sap.ui.Device.system.phone
          ? new ValueHelpDialog({
              title: sTitle,
              supportMultiselect: false,
              key: sKey,
              descriptionKey: sDescriptionKey,
              ok: onConfirm,
              // eslint-disable-next-line no-unused-vars
              cancel: function (oCancelEvent) {
                oController._oValueHelpDialog.close();
              },
              afterClose: function () {
                this.destroy();
                oController._oValueHelpDialog = null;
              },
              // eslint-disable-next-line no-unused-vars
              selectionChange: function (oSelecionEvent) {},
            })
          : new ValueHelpDialog({
              title: sTitle,
              supportMultiselect: false,
              key: sKey,
              descriptionKey: sDescriptionKey,
              supportRanges: false,
              supportRangesOnly: false,
              stretch: sap.ui.Device.system.phone,
              ok: onConfirm,
              // eslint-disable-next-line no-unused-vars
              cancel: function (oCancelEvent) {
                oController._oValueHelpDialog.close();
              },
              afterClose: function () {
                this.destroy();
                oController._oValueHelpDialog = null;
              },
              // eslint-disable-next-line no-unused-vars
              selectionChange: function (oSelecionEvent) {},
            });
      },

      /**
       * Handles Columns in value help.
       *
       * Set Kunag column and bind its rows to 'ClientesSet'
       *
       * @function
       * @private
       */
      _setVHKunagTable: function () {
        oController._oValueHelpDialog.getTableAsync().then(
          function (oTable) {
            var oColumn = new sap.ui.table.Column({
              label: new Label({ text: "Cliente" }),
              template: new sap.m.Text({
                text: "[{Cliente}] - {ClienteTexto}",
              }),
            });
            if (oTable.bindRows) {
              oTable.addColumn(oColumn);
              oTable.bindAggregation("rows", "/ClientesSet");
            }
            oController._oValueHelpDialog.update();
          }.bind(this)
        );
      },
      /* =========================================================== */
      /* End of Internal Methods                                     */
      /* =========================================================== */
    });
  }
);
