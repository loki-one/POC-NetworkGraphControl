var RequestHandler = function () {
    this.conn = null;

    /**
     * creates connection to database
     */
    this.openConnection = function()
    {
        try {
            this.conn = $.hdb.getConnection();
            this.conn.setAutoCommit(1);
        } catch (err) {
            $.trace.error("Failed to open database connection");
            throw err;
        }
    };

    /**
     * closes connection to database
     */
    this.closeConnection = function() {
        if (this.conn === null) {
            $.trace.error("Couldn't close connection because the connection wasn't open");
        } else {
            try {
                this.conn.close();
                this.conn = null;
            } catch (err) {
                $.trace.error("Failed to close the database connection");
                throw err;
            }
        }
    };

    /**
     * Checks if there is a connection
     */
    this.checkConnection = function() {
        if (this.conn === null) {
            throw "Not connected";
        }
    };
    
    this.getGraphProcedureNames = function () {
        this.checkConnection();
        try {
//            var query = 'select "PROCEDURE_NAME", "INPUT_PARAMETER_COUNT" from "SYS"."PROCEDURES" where "PROCEDURE_TYPE" = ? and "SCHEMA_NAME" = ?';
//            var argsArray = [query, 'GRAPH', 'SYSTEM'];
            var query = 'select "PROCEDURE_NAME", "INPUT_PARAMETER_COUNT", "SCHEMA_NAME" from "SYS"."PROCEDURES" where "PROCEDURE_TYPE" = ?';
            var argsArray = [query, 'GRAPH'];
            var rs = this.conn.executeQuery.apply(this.conn, argsArray);
            //converting array like object eg: {"0":{"PROCEDURE_NAME":"GET_VERTICES_COUNT","INPUT_PARAMETER_COUNT":0},"1":{"PROCEDURE_NAME":"getVertices","INPUT_PARAMETER_COUNT":0}}
            //to array of object [{"PROCEDURE_NAME":"GET_VERTICES_COUNT","INPUT_PARAMETER_COUNT":0},{"PROCEDURE_NAME":"getVertices","INPUT_PARAMETER_COUNT":0}]
            var arrayResult = Array.prototype.slice.call(rs);
            return arrayResult;
        }catch (err) {
            this.conn.close();
            this.conn = null;
            throw "unexpected error, please check application trace files for more information";
        }
    };
    
    this.getProcedureInputParameters = function (selectedProcedure, selectedProcedureSchema){
        this.checkConnection();
        try {
            var query = 'SELECT "PARAMETER_NAME", "DATA_TYPE_NAME" from "SYS"."PROCEDURE_PARAMETERS" where "PARAMETER_TYPE" = ? AND "PROCEDURE_NAME" = ? AND "SCHEMA_NAME" = ? ';
            var argsArray = [query, 'IN', selectedProcedure, selectedProcedureSchema];
            var rs = this.conn.executeQuery.apply(this.conn, argsArray);
            var arrayResult = Array.prototype.slice.call(rs);
            //$.trace.error(JSON.stringify(arrayResult)); //[{"PARAMETER_NAME":"VERTEXNAME","DATA_TYPE_NAME":"VARCHAR"}]
            return arrayResult;
        } catch (err) {
            this.conn.close();
            this.conn = null;
            throw "unexpected error, please check application trace files for more information";
        }
    };
    
    this.getProcedureAttributes = function (selectedProcedure, selectedProcedureSchema) {
        this.checkConnection();
        try {
            var query = 'SELECT "COLUMN_NAME", "TABLE_COLUMNS"."DATA_TYPE_NAME", "TABLE_COLUMNS"."TABLE_NAME", "PROCEDURE_PARAMETERS"."PARAMETER_NAME" FROM "SYS"."PROCEDURE_PARAMETERS" inner join "SYS"."TABLE_COLUMNS" on "PROCEDURE_PARAMETERS"."TABLE_TYPE_NAME" = "TABLE_COLUMNS"."TABLE_NAME" AND "PROCEDURE_PARAMETERS"."PROCEDURE_NAME" = ? AND "PROCEDURE_PARAMETERS"."SCHEMA_NAME" = ? AND "PROCEDURE_PARAMETERS"."TABLE_TYPE_SCHEMA" = ?; ';
            //var argsArray = [query, selectedProcedure, selectedProcedureSchema, 'SYSTEM'];
            var argsArray = [query, selectedProcedure, selectedProcedureSchema, selectedProcedureSchema];
            var rs = this.conn.executeQuery.apply(this.conn, argsArray);
            var arrayResult = Array.prototype.slice.call(rs);
            //$.trace.error(JSON.stringify(arrayResult));
            return arrayResult;
        } catch (err) {
            this.conn.close();
            this.conn = null;
            throw "unexpected error, please check application trace files for more information";
        }
    };
    
    this.getProcedureOutput = function (selectedProcedure, selectedProcedureSchema, procedureInput) {
        this.checkConnection();
        try {
            var query = this.conn.loadProcedure(selectedProcedureSchema, selectedProcedure);
            //$.trace.error(procedureInput);
            var result;
            if (!procedureInput) {
                result = query();
            } else if (!Array.isArray(procedureInput)) {
                result = query(procedureInput);
            } else if (Array.isArray(procedureInput)){
                if (procedureInput.length === 1) {
                    result = query(procedureInput[0]);
                } else if (procedureInput.length === 2) {
                    result = query(procedureInput[0], procedureInput[1]);
                }
            }
               //$.trace.error(JSON.stringify(result));
            return result;
        } catch (err) {
            this.conn.close();
            this.conn = null;
            throw "unexpected error, please check application trace files for more information";
        }
    };

};