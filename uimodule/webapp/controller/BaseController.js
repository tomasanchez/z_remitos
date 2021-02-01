/**
 * Global fragment storage
 * @array
 * @private
 */
var _fragments = [];

sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/ui/core/UIComponent",
  "com/profertil/Remitos/model/formatter"
], function(Controller, History, UIComponent, formatter) {
  "use strict";

  return Controller.extend("com.profertil.Remitos.controller.BaseController", {

    formatter: formatter,

    /**
     * Convenience method for getting the view model by name in every controller of the application.
     * @public
     * @param {string} sName the model name
     * @returns {sap.ui.model.Model} the model instance
     */
    getModel: function(sName) {
      return this.getView().getModel(sName);
    },

    /**
     * Convenience method for setting the view model in every controller of the application.
     * @public
     * @param {sap.ui.model.Model} oModel the model instance
     * @param {string} sName the model name
     * @returns {sap.ui.mvc.View} the view instance
     */
    setModel: function(oModel, sName) {
      return this.getView().setModel(oModel, sName);
    },

    /**
     * Convenience method for getting the resource bundle.
     * @public
     * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
     */
    getResourceBundle: function() {
      return this.getOwnerComponent().getModel("i18n").getResourceBundle();
    },

		/**
		 * Convenience method for getting a value from i18n.
		 * @public
		 * @param {string} sKey the token-key to get the value to read
		 * @returns {string} the text value of the key
		 */
		readFromI18n: function (sKey) {
			return this.getResourceBundle().getText(sKey);
		},

    /**
     * Method for navigation to specific view
     * @public
     * @param {string} psTarget Parameter containing the string for the target navigation
     * @param {mapping} pmParameters? Parameters for navigation
     * @param {boolean} pbReplace? Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
     */
    navTo: function(psTarget, pmParameters, pbReplace) {
      this.getRouter().navTo(psTarget, pmParameters, pbReplace);
    },

		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
    getRouter: function() {
      return UIComponent.getRouterFor(this);
    },


    /**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
    onNavBack: function() {
      var sPreviousHash = History.getInstance().getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.back();
      } else {
        this.getRouter().navTo("appHome", {}, true /*no history*/ );
      }
    },

    		/**
		 * Convenince method for openning a Fragment
		 * @public
		 * @param {string} sName the fragment name
		 * @param {sap.ui.mvc.Model} model to be set(optional)
		 * @param {boolean} updateModelAllways let the function know if it has to update the model every time it opens the dialog or only the first time.
		 * @param {function} callbak a function in the controller from where it’s called which can be executed from the fragment controller
		 * @param {obejct} data passed from the main view to the fragment
		 */
		openFragment: function (sName, model, updateModelAlways, callback, data) {

			if (sName.indexOf(".") > 0) {
				var aViewName = sName.split(".");
				sName = sName.substr(sName.lastIndexOf(".") + 1);
			} else { //current folder
				aViewName = this.getView().getViewName().split("."); // view.login.Login
			}

			aViewName.pop();
			var sViewPath = aViewName.join("."); // view.login

			if (sViewPath.toLowerCase().indexOf("fragments") > 0) {
				sViewPath += ".";
			} else {
				sViewPath += ".fragments.";
			}

			var id = this.getView().getId() + "-" + sName;
			if (!_fragments[id]) {
				//create controller
				var sControllerPath = sViewPath.replace("view", "controller");
				try {
					var controller = sap.ui.controller(sControllerPath + sName);
				} catch (ex) {
					controller = this;
				}
				_fragments[id] = {
					fragment: (sap.ui.require([
						"sap/ui/core/Fragment"
					], function (Fragment) {
						Fragment.load({
							id: id,
							name: sViewPath + sName,
							controller: controller
						}).then(function (oFragment) {
							// version >= 1.20.x
							_fragments[id].fragment = oFragment;
							this.getView().addDependent(oFragment);
							var fragment = oFragment;

							if (model && updateModelAlways) {
								fragment.setModel(model);
							}
							if (_fragments[id].controller && _fragments[id].controller !== this) {
								_fragments[id].controller.onBeforeShow(this, fragment, callback, data);
							}

							setTimeout(function () {
								fragment.open();
							}, 100);
						}.bind(this));
					}.bind(this))),
					controller: controller
				};

			} else
			_fragments[id].fragment.open();

		},

		/**
		 * Convenince method for getting a control from in the fragment
		 * @public
		 * @param {sap.ui.mvc.parent}
		 * @param {string} id of control
		 * Use example:
		 *	var oButton = this.fragmentById(this.parent,"button0");
		 */
		fragmentById: function (parent, id) {
			var latest = this.getMetadata().getName().split(".")[this.getMetadata().getName().split(".").length - 1];
			return sap.ui.getCore().byId(parent.getView().getId() + "-" + latest + "--" + id);
		},

		/**
		 * Convenince method for closing all opened Fragments
		 * @function
		 * @public
		 */
		closeFragments: function () {
			/*
				This makes it easy for a close button in each fragment. It just calls this function and it will close the open fragments. (In case the fragment contains a dialog.)
			*/
			for (var f in _fragments) {
				if (_fragments[f]["fragment"] && _fragments[f].fragment["isOpen"] && _fragments[f].fragment.isOpen()) {
					_fragments[f].fragment.close();
				}
			}
		},

		/**
		 * Convenince method for getting an specific fragment
		 * @public
		 * @param {string} fragment name
		 */
		getFragment: function (fragment) {
			return _fragments[this.getView().getId() + "-" + fragment];
    },

    /**
		 * Adds a history entry in the FLP page history
		 * @public
		 * @param {object} oEntry An entry object to add to the hierachy array as expected from the ShellUIService.setHierarchy method
		 * @param {boolean} bReset If true resets the history before the new entry is added
		 */
		addHistoryEntry: (function () {
			var aHistoryEntries = [];

			return function (oEntry, bReset) {
				if (bReset) {
					aHistoryEntries = [];
				}

				var bInHistory = aHistoryEntries.some(function (oHistoryEntry) {
					return oHistoryEntry.intent === oEntry.intent;
				});

				if (!bInHistory) {
					aHistoryEntries.push(oEntry);
					this.getOwnerComponent().getService("ShellUIService").then(function (oService) {
						oService.setHierarchy(aHistoryEntries);
					});
			  }
      };

		  })()

  });

});
