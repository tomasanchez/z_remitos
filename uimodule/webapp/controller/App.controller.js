sap.ui.define([
  "com/profertil/Remitos/controller/BaseController",
  "sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
  "use strict";

  return Controller.extend("com.profertil.Remitos.controller.App", {

  /**
	 * Called when the App controller is instantiated.
	 * @public
	 */
  onInit: function () {
			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function() {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

      // disable busy indication when the metadata is loaded and in case of errors
      var oModel = this.getOwnerComponent().getModel();

      if (oModel){
			oModel.metadataLoaded().
				then(fnSetAppNotBusy);
		  oModel.attachMetadataFailed(fnSetAppNotBusy);
      }


			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}


  });
});
