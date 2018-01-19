$.import("public.GraphVisualizer.XS_Backend.js.lib", "RequestHandler");
var RHandler = new $.public.GraphVisualizer.XS_Backend.js.lib.RequestHandler.RequestHandler();

var resp = { obj : undefined };

function setResponse(status, body, trace) {
    var sBody = ((typeof body === "string") ? body : JSON.stringify(body));
    if (trace) { trace(sBody); }
    $.response.contentType = "application/json";
    $.response.status = status;
    $.response.setBody(sBody);
}

function databaseOperation(operation) {
    try {
        RHandler.openConnection();
        //$.trace.error(JSON.stringify(arguments));
        $.trace.error(JSON.stringify(Array.prototype.slice.call(arguments, 1)));
        resp.obj = operation.apply(RHandler, Array.prototype.slice.call(arguments, 1));
        //$.trace.error(resp.obj);
        setResponse($.net.http.OK, resp);
    } catch (e) {
        setResponse($.net.http.INTERNAL_SERVER_ERROR, e.toString(), $.trace.error);
    }
     finally {
        RHandler.closeConnection();
    }
}

try {
    var data = JSON.parse($.request.body.asString());
    $.trace.error(JSON.stringify(data));
} catch (e) {
    setResponse($.net.http.BAD_REQUEST, e.toString(), $.trace.error);
}


if (!data.command) { data.command = ""; }

switch (data.command) {
    case "getGraphProcedureNames":
        databaseOperation(RHandler.getGraphProcedureNames);
        break;
    case "getProcedureInputParameters":
        databaseOperation(RHandler.getProcedureInputParameters, data.selectedProcedure, data.selectedProcedureSchema);
        break;
    case "getProcedureAttributes":
        databaseOperation(RHandler.getProcedureAttributes, data.selectedProcedure, data.selectedProcedureSchema);
        break;
    case "getProcedureOutput":
        databaseOperation(RHandler.getProcedureOutput, data.selectedProcedure, data.selectedProcedureSchema, data.procedureInput);
        break;
    case "":
        setResponse($.net.http.BAD_REQUEST, 'Command "' + data.command + '" is not handled', $.trace.error);
        break;
    default:
        setResponse($.net.http.BAD_REQUEST, 'Command "' + data.command + '" is not handled', $.trace.error);
        break;
}