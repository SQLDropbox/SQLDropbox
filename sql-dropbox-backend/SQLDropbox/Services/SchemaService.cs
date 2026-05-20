using Npgsql;
using System.Text;

namespace SQLDropbox.Services
{
    public class SchemaService
    {
        private readonly string _connectionString;

        public SchemaService(IConfiguration config) { _connectionString = config.GetConnectionString("DefaultConnection"); }

        public async Task<bool> SchemaExistsAsync(string schemaName)
        {
            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();

            const string sql = @"SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = @schemaName);";

            await using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("schemaName", schemaName);

            var result = await cmd.ExecuteScalarAsync();
            return result is bool exists && exists;
        }

        public async Task<string> CloneSchemaAsync(string sourceSchema)
        {
            var targetSchema = $"{sourceSchema}_session_{Guid.NewGuid():N}";

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();

            await using var cmd = new NpgsqlCommand("CALL animals.sp_clone_schema(@source, @target);", conn);
            cmd.Parameters.AddWithValue("source", sourceSchema);
            cmd.Parameters.AddWithValue("target", targetSchema);

            await cmd.ExecuteNonQueryAsync();

            return targetSchema;
        }

        public bool IsSafeSelectQuery(string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return false;

            var trimmed = query.Trim();

            if (trimmed.EndsWith(";")) trimmed = trimmed[..^1].Trim();
            if (!trimmed.StartsWith("SELECT", StringComparison.OrdinalIgnoreCase)) return false;
            if (trimmed.Contains("--") || trimmed.Contains("/*") || trimmed.Contains("*/")) return false;

            var forbidden = new[] { "INSERT ", "UPDATE ", "DELETE ", "DROP ", "ALTER ", "CREATE ", "TRUNCATE ", "CALL ", "DO ", "COPY ", "GRANT ", "REVOKE " };

            return !forbidden.Any(x => trimmed.Contains(x, StringComparison.OrdinalIgnoreCase));
        }

        public async Task<string> ExecuteSelectOnSchemaAsync(string schemaName, string selectQuery)
        {
            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();

            await using (var setPathCmd = new NpgsqlCommand($"SET search_path TO \"{schemaName}\";", conn))
            {
                await setPathCmd.ExecuteNonQueryAsync();
            }

            var trimmed = selectQuery.Trim();
            if (trimmed.EndsWith(";"))
                trimmed = trimmed[..^1];

            var copySql = $@"COPY ({trimmed}) TO STDOUT WITH (FORMAT CSV, HEADER true)";
            using var reader = conn.BeginTextExport(copySql);
            var sb = new StringBuilder();

            while (true)
            {
                var line = await reader.ReadLineAsync();
                if (line is null)
                    break;

                sb.AppendLine(line);
            }

            return sb.ToString();
        }

        public async Task<string> CloneQueryAndDeleteAsync(string sourceSchema, string selectQuery)
        {
            string? clonedSchema = null;

            try
            {
                clonedSchema = await CloneSchemaAsync(sourceSchema);
                return await ExecuteSelectOnSchemaAsync(clonedSchema, selectQuery);
            }
            finally
            {
                if (!string.IsNullOrWhiteSpace(clonedSchema))
                {
                    try
                    {
                        await DeleteSchemaAsync(clonedSchema);
                    }
                    catch
                    {
                        // WIP
                    }
                }
            }
        }

        public async Task DeleteSchemaAsync(string schemaName)
        {
            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = $@"DROP SCHEMA IF EXISTS ""{schemaName}"" CASCADE";

            await using var cmd = new NpgsqlCommand(sql, conn);
            await cmd.ExecuteNonQueryAsync();
        }
    }

    // had to add do this in pgAdmin:
    // GRANT USAGE ON SCHEMA animals TO sqldropbox_admin;
    // GRANT SELECT ON ALL TABLES IN SCHEMA animals TO sqldropbox_admin;
    // GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA animals TO sqldropbox_admin;
}