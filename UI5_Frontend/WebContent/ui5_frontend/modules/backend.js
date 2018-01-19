sap.ui.define([], function () {
    "use strict";
    return {
            _url: "/public/GraphVisualizer/XS_Backend/js/csrf.xsjs",
            _url_csrf: "/public/GraphVisualizer/XS_Backend/js/procedurerequest.xsjs",
            
            _doRequest: function (data, success) {
                    var token = null;
                    
                    $.ajax({
                       type: "GET",
                       url: this._url,
                       async: false,
                       cache: false,
                       headers: {
                             'X-CSRF-Token': 'Fetch'
                       },
                       complete: function (jqXHR) {
                            token = jqXHR.getResponseHeader("X-CSRF-Token");
                       }
                    });
                    
                    $.ajax({
                       type: "POST",
                       url: this._url_csrf,
                       headers:  {
                           'X-CSRF-Token': token
                       },
                       async : true,
                       dataType : 'json',
                       contentType: 'application/json',
                       data : JSON.stringify(data),
                       success: function(oResponse) {
                            success(oResponse);
                       }
                   });
                    
               },
               
               getAllGraphProcedures: function (success) {
                 this._doRequest({
                      command: "getGraphProcedureNames"
                 }, success);
               },
               loadProcedureInputParameters: function (selectedProcedure, selectedProcedureSchema, success) {
                   this._doRequest ({
                       selectedProcedure: selectedProcedure,
                       selectedProcedureSchema: selectedProcedureSchema,
                       command: "getProcedureInputParameters"
                   }, success);
               },
               loadProcedureAttributes: function (selectedProcedure, selectedProcedureSchema, success) {
                   this._doRequest ({
                       selectedProcedure: selectedProcedure,
                       selectedProcedureSchema: selectedProcedureSchema,
                       command: "getProcedureAttributes"
                   }, success);
               },
               loadProcedureOutput: function (selectedProcedure, selectedProcedureSchema, input, success) {
                   this._doRequest ({
                       selectedProcedure: selectedProcedure,
                       selectedProcedureSchema: selectedProcedureSchema,
                       procedureInput: input,
                       command: "getProcedureOutput"
                   }, success);
               }
    };
});
