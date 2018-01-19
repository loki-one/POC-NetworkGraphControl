sap.ui.define([
   "sap/ui/core/UIComponent",
   "sap/ui/model/json/JSONModel",
   "public/GraphVisualizer/UI5_Frontend/WebContent/ui5_frontend/modules/backend"
], function (UIComponent, JSONModel, backend) {
   "use strict";
   return UIComponent.extend("public.GraphVisualizer.UI5_Frontend.WebContent.ui5_frontend.Component", {

       metadata : {
           manifest: "json"
     },

      init : function () {
         UIComponent.prototype.init.apply(this, arguments);
         this.backend = backend;
    },

   });
});