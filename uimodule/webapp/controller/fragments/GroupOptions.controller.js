/**
 * Group Options Fragment Controller.
 *
 * Split code for fragment controlling.
 *
 * @file This files describes Group Options controller.
 * @author Tomas A. Sanchez
 * @since 2.23.2021
 */
sap.ui.define(["../BaseController"], function (BaseController) {
  "use strict";
  // .bind(this) short cut
  var oFragmentController;
  return BaseController.extend(
    "com.profertil.Remitos.controller.fragments.GroupOptions",
    {
      /* =========================================================== */
      /* lifecycle methods */
      /* =========================================================== */

      /**
       * Called before the fragment is show.
       * Attachs before open event.
       */
      onBeforeShow: function (parent, fragment, callback, data) {
        // eslint-disable-next-line no-unused-vars
        oFragmentController = this;
        this.parent = parent;
        this.fragment = fragment;
        this.callback = callback;
        this.oTable = data;

        this.fragment.attachConfirm(this.onConfirm, this);
      },

      _bindView: function () {
        return;
      },

      _onBindingChange: function () {
        return;
      },

      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */

      /**
       * Closes dialog confirming.
       *
       * Confirms group options.
       * @function
       * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
       * @public
       */
      onConfirm: function (oEvent) {
        var mParams = oEvent.getParameters();
        this._sortTable(mParams);
      },

      /**
       * Triggered when close button is pressed.
       * Closes dialog and executes callback function.
       * @function
       * @public
       */
      onClose: function () {
        oFragmentController.fragment.close();
        if (oFragmentController.callback)
          oFragmentController.callback.call(oFragmentController.parent);
      },

      /* =========================================================== */
      /* Internal methods                                            */
      /* =========================================================== */

      /**
       * Sorts Table.
       *
       * @function
       * @private
       * @param {object} mParams the confirm event parameters
       */
      _sortTable: function (mParams) {
        var aSorters = this._createSorters(mParams),
          oBinding = this.oTable.getBinding("items");

        // Sort only if has filters
        if (aSorters.length > 0) oBinding.sort(aSorters);
      },

      /**
       * Creates Sorters.
       *
       * @function
       * @private
       * @param {object} mParams the confirm event parameters
       * @returns {array} an array of sap.ui.model.Sorter
       */
      _createSorters: function (mParams) {
        var aSorters = [];
        // Sorter constructors
        const // the binding path used for sorting
          sPath = mParams.sortItem ? mParams.sortItem.getKey() : "",
          // whether the sort order should be descending
          bDescending = mParams.sortDescending,
          // Configure grouping of the content
          vGroup = (oContext) => {
            var name = oContext.getProperty(sPath);
            return {
              key: name,
              text: name,
            };
          };

        // Push sorter only if selected item
        if (sPath.length > 0)
          aSorters.push(
            new sap.ui.model.Sorter(sPath, bDescending, vGroup)
          );

        return aSorters;
      },
    }
  );
});
