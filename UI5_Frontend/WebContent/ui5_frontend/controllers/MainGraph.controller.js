sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast"
], function (Controller, MessageToast) {
   "use strict";

   return Controller.extend("public.GraphVisualizer.UI5_Frontend.WebContent.ui5_frontend.controllers.MainGraph", {

        mergeChanged: function (oEvent) {
            var oModel = this.getView().getModel();
            oModel.setProperty("/networkGraphSettings/mergeEdges", !!Number(oEvent.getSource().getProperty("selectedKey")));
        },
        spacingChanged: function(oEvent) {
            var oModel = this.getView().getModel();
            oModel.setProperty("/networkGraphSettings/nodeSpacing", Number(oEvent.getSource().getProperty("selectedKey")));
        },
        onAfterRendering: function() {
            var model = this.getView().getModel();
            if (model.getProperty("/selectedProcedure") === null) {
                this.onOpenProcedureSelectionDialog();
            }
        },
        onOpenProcedureSelectionDialog : function () {
              var oView = this.getView();
              var oDialog = oView.byId("selectProcedureDialog");
              
             if (!oDialog) {
                oDialog = sap.ui.xmlfragment(oView.getId(), "public.GraphVisualizer.UI5_Frontend.WebContent.ui5_frontend.views.ProcedureSelection", this);
                 oView.addDependent(oDialog);
              }
              
              oDialog.open();
              
              var oModel = this.getView().getModel();
              //Loading all Graph Script Procedures
              this.getOwnerComponent().backend.getAllGraphProcedures(function(oResponse){
                    //console.log(oResponse);
                    oModel.setProperty("/graphProcedures", oResponse.obj);
                 });
          },
          onCloseProcedureSelectionDialog : function () {
               this.getView().byId("selectProcedureDialog").close();
           },
          onProcedureSelect: function (oEvent) {
               var selectedProcedure = oEvent.getParameters().listItem.getBindingContext().getObject();
               var oModel = this.getView().getModel();
               oModel.setProperty("/selectedProcedure", selectedProcedure);
               this.onConfirmProcedureSelection();
           },
          getSelectedProcedure: function () {
               var oModel = this.getView().getModel();
               if (oModel.getProperty("/selectedProcedure")){
                   return oModel.getProperty("/selectedProcedure").PROCEDURE_NAME;
               }
           },
           hasProcedureInputParameter: function () {
               var hasParameters = false;
               var inputParameterCount;
               var oModel = this.getView().getModel();
               if (oModel.getProperty("/selectedProcedure")){
                   inputParameterCount = oModel.getProperty("/selectedProcedure").INPUT_PARAMETER_COUNT;
               }
               if (inputParameterCount > 0) {
                   hasParameters = true;
               }
               return hasParameters;
           },
           getSelectedProcedureSchema: function () {
               var oModel = this.getView().getModel();
               if (oModel.getProperty("/selectedProcedure")){
                   return oModel.getProperty("/selectedProcedure").SCHEMA_NAME;
               }
           },
           onConfirmProcedureSelection: function () {
               //close the Procedure Selection Dialog
               this.onCloseProcedureSelectionDialog();

               //check for input parameters of selected procedure
               var hasInputParameter = this.hasProcedureInputParameter();
               var oView = this.getView();
               var oDialog;
               
               /*If has input parameter then open Procedure Input Fragment or else Open Output Fragment*/
               //hasInputParameter = true;
               if(hasInputParameter) {
                   oDialog = oView.byId("procedureInputDialog");
                   if (!oDialog) {
                      oDialog = sap.ui.xmlfragment(oView.getId(), "public.GraphVisualizer.UI5_Frontend.WebContent.ui5_frontend.views.ProcedureInput", this);
                      oView.addDependent(oDialog);
                   }
                   oDialog.open();
                   var oModel = this.getView().getModel();
                   //Loading Procedure Input Parameter Attributes
                   this.getOwnerComponent().backend.loadProcedureInputParameters (this.getSelectedProcedure(), this.getSelectedProcedureSchema(), function (oResponse) {
                       //console.log('Procedure Input : ', oResponse.obj);
                       oModel.setProperty("/procedureInputParameters", oResponse.obj);
                   });

               } else {
                    oDialog = oView.byId("procedureOutputDialog");
                   
                   if (!oDialog) {
                      oDialog = sap.ui.xmlfragment(oView.getId(), "public.GraphVisualizer.UI5_Frontend.WebContent.ui5_frontend.views.ProcedureOutput", this);
                      oView.addDependent(oDialog);
                   }
                   oDialog.open();
                   //this.validateOnLoadGraph();
                   this.onLoadProcedure(this.getSelectedProcedure(), this.getSelectedProcedureSchema());
               }
               
           },
           onCloseProcedureInputDialog: function() {
               this.getView().byId("procedureInputDialog").close();
           },
           onLoadProcedureOutput: function () {
               
               //close the Procedure Input Dialog
               this.onCloseProcedureInputDialog();
               
               var oView = this.getView();
               var oDialog;
               oDialog = oView.byId("procedureOutputDialog");
               
               if (!oDialog) {
                  oDialog = sap.ui.xmlfragment(oView.getId(), "public.GraphVisualizer.UI5_Frontend.WebContent.ui5_frontend.views.ProcedureOutput", this);
                  oView.addDependent(oDialog);
               }
               oDialog.open();
               //this.validateOnLoadGraph();
               this.onLoadProcedure(this.getSelectedProcedure(), this.getSelectedProcedureSchema());
           },
           getProcedureInputParameterCount: function () {
               var oModel = this.getView().getModel();
               if (oModel.getProperty("/selectedProcedure")){
                   return oModel.getProperty("/selectedProcedure").INPUT_PARAMETER_COUNT;
               }
           },
           onLoadProcedure: function (selectedProcedure, selectedProcedureSchema) {
               var oModel = this.getView().getModel();
               //Loading selected Procedure Attributes
               this.getOwnerComponent().backend.loadProcedureAttributes (selectedProcedure, selectedProcedureSchema, function (oResponse) {
                   console.log(oResponse.obj);
                   oModel.setProperty("/procedureAttributes", oResponse.obj);
               });
               
               var procedureInputCount = this.getProcedureInputParameterCount();
               
               if (procedureInputCount === 0) {
                   var input;
                   this.getOwnerComponent().backend.loadProcedureOutput (selectedProcedure, selectedProcedureSchema, input, function (oResponse) {
                       console.log('Procedure data: ', oResponse.obj);
                       oModel.setProperty("/procedureData", oResponse.obj);
                   });
               } else if (procedureInputCount  > 0) {
                   var inputListContext = this.getView().byId("singleInputProcedure");
                   var inputitems = inputListContext.getItems();
                   var inputItemsContent = inputitems.map(function (inputitem){
                        return inputitem.getContent().map(function(inputitemContent){
                            return inputitemContent.getValue();
                            });
                    });
                   if (inputItemsContent.length === 1){
                      input = inputItemsContent[0];
                   } else {
                      input = [inputItemsContent[0][0], inputItemsContent[1][0]];
                   }
                   
                   this.getOwnerComponent().backend.loadProcedureOutput (selectedProcedure, selectedProcedureSchema, input, function (oResponse) {
                       //console.log('Procedure data: ', oResponse.obj);
                       oModel.setProperty("/procedureData", oResponse.obj);
                   });
                }
           },
           validateOnLoadGraph: function () {
               var vertexKey = this.getView().byId("vertexKey");
               var edgeKey = this.getView().byId("edgeKey");
               var source = this.getView().byId("source");
               var target = this.getView().byId("target");

               var isLoadGraphButtonEnabled = true;

               if (vertexKey.getSelectedKey() === edgeKey.getSelectedKey()) {
                   vertexKey.setValueState(sap.ui.core.ValueState.Error);
                   edgeKey.setValueState(sap.ui.core.ValueState.Error);
                   //vertexKey.setValueStateText("Vertex Key and Edge Key cannot be same");
                   isLoadGraphButtonEnabled = false;
               } else if (vertexKey.getSelectedKey() === source.getSelectedKey()) {
                   vertexKey.setValueState(sap.ui.core.ValueState.Error);
                   source.setValueState(sap.ui.core.ValueState.Error);
                   //vertexKey.setValueStateText("Vertex Key and Source cannot be same");
                   isLoadGraphButtonEnabled = false;
               } else if (vertexKey.getSelectedKey() === target.getSelectedKey()) {
                   vertexKey.setValueState(sap.ui.core.ValueState.Error);
                   target.setValueState(sap.ui.core.ValueState.Error);
                   //vertexKey.setValueStateText("Vertex Key and Target cannot be same");
                   isLoadGraphButtonEnabled = false;
               } else {
                    vertexKey.setValueState(sap.ui.core.ValueState.None);
                    if (edgeKey.getSelectedKey() === source.getSelectedKey()) {
                        edgeKey.setValueState(sap.ui.core.ValueState.Error);
                        source.setValueState(sap.ui.core.ValueState.Error);
                        //edgeKey.setValueStateText("Edge Key and Source cannot be same");
                        isLoadGraphButtonEnabled = false;
                        if (edgeKey.getSelectedKey() === target.getSelectedKey()) {
                            target.setValueState(sap.ui.core.ValueState.Error);
                        } else {
                            target.setValueState(sap.ui.core.ValueState.None);
                        }
                    } else if (edgeKey.getSelectedKey() === target.getSelectedKey()) {
                        edgeKey.setValueState(sap.ui.core.ValueState.Error);
                        target.setValueState(sap.ui.core.ValueState.Error);
                        //edgeKey.setValueStateText("Edge Key and Target cannot be same");
                        isLoadGraphButtonEnabled = false;
                    } else {
                        edgeKey.setValueState(sap.ui.core.ValueState.None);
                        if (source.getSelectedKey() === target.getSelectedKey()) {
                            source.setValueState(sap.ui.core.ValueState.Error);
                            target.setValueState(sap.ui.core.ValueState.Error);
                            //source.setValueStateText("Source and Target cannot be same");
                            isLoadGraphButtonEnabled = false;
                        } else {
                            //vertexKey.setValueState(sap.ui.core.ValueState.None);
                            //vertexKey.setValueStateText("");
                            //edgeKey.setValueState(sap.ui.core.ValueState.None);
                            //edgeKey.setValueStateText("");
                            source.setValueState(sap.ui.core.ValueState.None);
                            //source.setValueStateText("");
                            target.setValueState(sap.ui.core.ValueState.None);
                            //target.setValueStateText("");
                        }
                    }
               } 

               this.getView().byId("loadGraph").setEnabled(isLoadGraphButtonEnabled);

               return isLoadGraphButtonEnabled;
           },
           onCloseProcedureOutputDialog: function () {
               //resetting the keys to blank on closing of procedure output
               this.getView().byId("vertexKey").setSelectedKey("");
               this.getView().byId("edgeKey").setSelectedKey("");
               this.getView().byId("source").setSelectedKey("");
               this.getView().byId("target").setSelectedKey("");
           
               this.getView().byId("procedureOutputDialog").close();
           },
           onLoadGraph: function () {
           
               if (!this.validateOnLoadGraph()) {
                   return;
               }
               //console.log("loading Graph");
               var procedureAttributes = this.getView().getModel().getProperty("/procedureAttributes");
               var procedureData = this.getView().getModel().getProperty("/procedureData");
               
               var vertexKey = this.getView().byId("vertexKey");
               var edgeKey = this.getView().byId("edgeKey");
               var source = this.getView().byId("source");
               var target = this.getView().byId("target");
//             console.log("JSON to be generated from procedureAttributes: ");
//             console.log(procedureAttributes);
//             console.log("and procedure data: ");
//             console.log(procedureData);
//             console.log('selected keys are:\n vertexkey: ' + vertexKey.getSelectedKey() + '\n edge key: ' + edgeKey.getSelectedKey() + '\n source: ' + source.getSelectedKey() + '\n target: ' + target.getSelectedKey());

               function convertArrayLikeObjectToArray(arrayLikeObject) {
                    return Object.keys(arrayLikeObject).map(function(key) {
                        return arrayLikeObject[key]
                    });
               }

               if (vertexKey.getSelectedKey() && edgeKey.getSelectedKey() && source.getSelectedKey() && target.getSelectedKey()) {
                   var selectedVertexKey = vertexKey.getSelectedKey().split(" ")[0];
                   var selectedVertexKeyTable = vertexKey.getSelectedKey().split(" ")[2];
                   var selectedVertexKeyData = procedureData[selectedVertexKeyTable];
                   selectedVertexKeyData = convertArrayLikeObjectToArray(selectedVertexKeyData);
                   var nodeIds = selectedVertexKeyData.map( function (item) {
                       return item[selectedVertexKey];
                   });
               //console.log(nodeIds);
                   var selectedEdgeKey = edgeKey.getSelectedKey().split(" ")[0];
                   var selectedEdgeKeyTable = edgeKey.getSelectedKey().split(" ")[2];
                   var selectedEdgeKeyData = procedureData[selectedEdgeKeyTable];
                   selectedEdgeKeyData = convertArrayLikeObjectToArray(selectedEdgeKeyData);
                   var linkKeys = selectedEdgeKeyData.map( function (item) {
                       return item[selectedEdgeKey];
                   });
                   //console.log(linkKeys);
                   
                   var selectedSourceKey = source.getSelectedKey().split(" ")[0];
                   var selectedSourceKeyTable = source.getSelectedKey().split(" ")[2];
                   var selectedSourceKeyData = procedureData[selectedSourceKeyTable];
                   selectedSourceKeyData = convertArrayLikeObjectToArray(selectedSourceKeyData);
                   var sourceValues = selectedSourceKeyData.map( function (item) {
                       return item[selectedSourceKey];
                   });
                   //console.log(sourceValues);
                   
                   var selectedTargetKey = target.getSelectedKey().split(" ")[0];
                   var selectedTargetKeyTable = target.getSelectedKey().split(" ")[2];
                   var selectedTargetKeyData = procedureData[selectedTargetKeyTable];
                   selectedTargetKeyData = convertArrayLikeObjectToArray(selectedTargetKeyData);
                   var targetValues = selectedTargetKeyData.map( function (item) {
                       return item[selectedTargetKey];
                   });
                   //console.log(targetValues);
                   
                   var nodes = [];
                   var links = [];
                   
                   function Node (nodeId) {
                       this.id = nodeId;
                       this.status = "Standard";
                       this.attributes = [{
                           label: "Type",
                           value: "Primordial deity"
                       }];
                   }
                   
                   function Link (linkKey, source, target) {
                       this.source = source;
                       this.target = target;
                       this.attributes = [{
                           label : "key",
                           value : linkKey
                       }];
                   }
                   
                   nodeIds.forEach( function (nodeId) {
                       nodes.push(new Node(nodeId));
                   });
                   
                   nodes.forEach ( function (node) {
                       if (node.id === "Chaos") {
                           node.status = "Error";
                       } else if (node.id === "Ares" || node.id === "Persephone" || node.id === "Athena" || node.id === "Poseidon" || node.id === "Hephaestus") {
                           node.status = "Success";
                       } else if (node.id === "Cronus" || node.id === "Rhea") {
                           node.status = "Warning"
                       }
                   });
                   
                   //console.log(nodes);
                   
                   for (var i = 0; i < linkKeys.length; i++){
                       links.push(new Link (linkKeys[i], sourceValues[i], targetValues[i]));
                   }
                   
                   //console.log(links);
                   
                   var oModel = this.getView().getModel();
                   oModel.setProperty("/graph/nodes", nodes);
                   oModel.setProperty("/graph/links", links);
                   
                   this.onCloseProcedureOutputDialog();
               }
               
           }

   });
});