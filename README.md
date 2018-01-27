# POC-NetworkGraphControl
This was  POC created which demonstrates the usage of new UI5 control that came out which is called Network Graph. 
It is a XS classic application that demonstrates the usage of UI5 control named Network Graph.

# Graph Script Visualizer
This is a POC which demonstrates the usage of Network Graph UI5 control help to visualize Graph workspaces.

GraphScript is a language used to write procedures. It is helps to integrate complex graph script algorithms easily with built in functions in your procedure.

More details here: https://help.sap.com/viewer/f381aa9c4b99457fb3c6b53a2fd29c02/2.0.02/en-US

## Installing / Getting started

To get started you need to clone this repo with: git clone https://github.com/loki-one/POC-NetworkGraphControl.git
After you download it you can import it in the Hana Studio.
To make the backend procedures work you need to have Graph Workspace and corresponding Vertex and Edge tables.

When you run the index.html:
1) A pop up appears to select the GraphScript Procedures available from all your schemas.
2) When you select the GraphScript procedure if the Procedure has any input parameters then pop up to enter them appears or else if     there are no input parameters then you see the output attributes of the graphscript procedures and you need to specify which attribute you want as a vertex, edge, source and target.
3) After you provide all the mapping you can click on load Graph which then maps the GraphScript procedure data to appropriate vertex, edge, source and target and it can be then visualized with the help of Network Graph control.

## Developing

### Built With
SAPUI5 1.50 
You need this version of UI5 library because Network Graph control was introduced in this version.

SAP XSJS
Backend files are coded with xsjs.

### Prerequisites
SAPUI5 1.50 library CDN or the source code.
Graph Viewer delivery unit with Vertex, edge and Graph Workspace tables.

## Database

SAP Hana 
