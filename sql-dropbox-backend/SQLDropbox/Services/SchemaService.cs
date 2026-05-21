using Microsoft.Extensions.Configuration;
using Npgsql;
using SQLDropbox.Models;

namespace SQLDropbox.Services
{
    public class SchemaService {

        private readonly string _connectionString;
        private readonly SqlQueryService _sql;
        private readonly CsvExportService _csv;
        private readonly RoutineService _routineService;

        public SchemaService(IConfiguration config, SqlQueryService sql, CsvExportService csv, RoutineService routineService){
           
            _connectionString = config.GetConnectionString("DefaultConnection")!;
            _sql = sql;
            _csv = csv;
            _routineService = routineService;
        }

        private async Task<NpgsqlConnection> OpenConnectionAsync() {
            
            var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();
            return conn;
        }

        public async Task<bool> SchemaExistsAsync(string schemaName) {
            
            await using var conn = await OpenConnectionAsync();

            const string sql = @"
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.schemata
                    WHERE schema_name = @schemaName
                );";

            await using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("schemaName", schemaName);

            var result = await cmd.ExecuteScalarAsync();
            return result is bool b && b;
        }

        public async Task<string> CloneSchemaAsync(string sourceSchema) {
            
            var target = $"{sourceSchema}_session_{Guid.NewGuid():N}";

            await using var conn = await OpenConnectionAsync();
            await using var cmd = new NpgsqlCommand("CALL util.sp_clone_schema(@source, @target);", conn);

            cmd.Parameters.AddWithValue("source", sourceSchema);
            cmd.Parameters.AddWithValue("target", target);

            await cmd.ExecuteNonQueryAsync();

            return target;
        }

        public async Task DeleteSchemaAsync(string schemaName) {
            
            await using var conn = await OpenConnectionAsync();

            var sql = $@"DROP SCHEMA IF EXISTS ""{schemaName}"" CASCADE";

            await using var cmd = new NpgsqlCommand(sql, conn);
            await cmd.ExecuteNonQueryAsync();
        }

        public async Task<QueryExecutionResult> ExecuteQueryOnSchemaAsync(string schemaName, string sql) {
            
            await using var conn = await OpenConnectionAsync();
            await using var tx = await conn.BeginTransactionAsync();

            await using (var setPath = new NpgsqlCommand(
                $@"SET LOCAL search_path TO ""{schemaName}"";",
                conn,
                tx))
            {
                await setPath.ExecuteNonQueryAsync();
            }

            var trimmed = sql.Trim();
            if (trimmed.EndsWith(";"))  trimmed = trimmed[..^1];

            var commandType = _sql.GetCommandType(trimmed);
            var tableName = _sql.ExtractTableName(trimmed, commandType);

            await using (var cmd = new NpgsqlCommand(trimmed, conn, tx))
            {
                await cmd.ExecuteNonQueryAsync();
            }

            QueryExecutionResult result;

            if (commandType is "INSERT" or "UPDATE" or "DELETE")
            {
                var csv = await _csv.ExportTableAsync(conn, tableName!);

                result = new QueryExecutionResult
                {
                    CommandType = commandType,
                    TableName = tableName,
                    Message = $"{commandType} executed successfully.",
                    CsvContent = csv
                };
            }
            else if (commandType is "CREATE" or "ALTER")
            {
                if (!string.IsNullOrWhiteSpace(tableName))
                {
                    var csv = await _csv.ExportTableAsync(conn, tableName);

                    result = new QueryExecutionResult
                    {
                        CommandType = commandType,
                        TableName = tableName,
                        Message = $"{commandType} executed successfully.",
                        CsvContent = csv
                    };
                }
                else
                {
                    result = new QueryExecutionResult
                    {
                        CommandType = commandType,
                        TableName = tableName,
                        Message = $"{commandType} executed successfully."
                    };
                }
            }
            else
            {
                result = new QueryExecutionResult
                {
                    CommandType = commandType,
                    TableName = tableName,
                    Message = "Command executed successfully."
                };
            }

            await tx.CommitAsync();
            return result;
        }

        public async Task<string> ExecuteSelectOnSchemaAsync(string schemaName, string selectQuery) {
            
            await using var conn = await OpenConnectionAsync();

            await using (var cmd = new NpgsqlCommand($@"SET search_path TO ""{schemaName}"";", conn))
            {
                await cmd.ExecuteNonQueryAsync();
            }

            var trimmed = selectQuery.Trim();
            if (trimmed.EndsWith(";")) trimmed = trimmed[..^1];

            return await _csv.ExportQueryAsync(conn, trimmed);
        }

        public async Task<object> CloneQueryAndDeleteAsync(string sourceSchema, string query) {
            
            string? cloned = null;

            try
            {
                cloned = await CloneSchemaAsync(sourceSchema);

                if (query.TrimStart().StartsWith("SELECT", StringComparison.OrdinalIgnoreCase))
                {
                    return await ExecuteSelectOnSchemaAsync(cloned, query);
                }

                return await ExecuteQueryOnSchemaAsync(cloned, query);
            }
            finally
            {
                if (!string.IsNullOrWhiteSpace(cloned))
                {
                    try
                    {
                        await DeleteSchemaAsync(cloned);
                    }
                    catch
                    {
                        // ignore cleanup failures
                    }
                }
            }
        }

        public async Task<object?> CloneExecuteRoutineAndDeleteAsync(
    string sourceSchema,
    string routineSql,
    string? invokeSql,
    string? testSql,
    string? verifySql)
        {
            string? cloned = null;

            try
            {
                cloned = await CloneSchemaAsync(sourceSchema);

                return await _routineService.ExecuteRoutineAsync(
                    cloned,
                    routineSql,
                    invokeSql,
                    testSql,
                    verifySql);
            }
            finally
            {
                if (!string.IsNullOrWhiteSpace(cloned))
                {
                    try
                    {
                        await DeleteSchemaAsync(cloned);
                    }
                    catch
                    {
                        // ignore cleanup failures
                    }
                }
            }
        }
    }
}

// had to add do this in pgAdmin:
//GRANT USAGE ON SCHEMA util TO sqldropbox_admin;
//GRANT SELECT ON ALL TABLES IN SCHEMA util TO sqldropbox_admin;
//GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA util TO sqldropbox_admin;


//GRANT USAGE, CREATE ON SCHEMA animals TO sqldropbox_admin;
//GRANT USAGE ON LANGUAGE plpgsql TO sqldropbox_admin;
//GRANT SELECT ON ALL TABLES IN SCHEMA animals TO sqldropbox_admin;

//GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA animals TO sqldropbox_admin;
//GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA animals TO sqldropbox_admin;