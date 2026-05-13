using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Text;

namespace SQLDropbox.Services
{
    public class SchemaService
    {
        private readonly string _connectionString;

        public SchemaService(IConfiguration config) {_connectionString = config.GetConnectionString("DefaultConnection");}

        public async Task<string> CloneSchemaStaticAsync()
        {
            var targetSchema = $"animals_session_{Guid.NewGuid():N}";

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();

            await using var cmd = new NpgsqlCommand("CALL public.sp_clone_schema(@source, @target);", conn);

            cmd.Parameters.AddWithValue("source", "animals");
            cmd.Parameters.AddWithValue("target", targetSchema);

            await cmd.ExecuteNonQueryAsync();

            return targetSchema;
        }

        public async Task<string> ExportTableStaticAsync(string schemaName, string tableName)
        {
            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();

            var copySql =   $@" COPY (SELECT * FROM ""{schemaName}"".""{tableName}"") TO STDOUT WITH (FORMAT CSV, HEADER true)";

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

        public async Task DeleteLatestSchemaAsync(string schemaName)
        {
            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();

            var sql = $"DROP SCHEMA IF EXISTS \"{schemaName}\" CASCADE";

            await using var cmd = new NpgsqlCommand(sql, conn);
            await cmd.ExecuteNonQueryAsync();
        }
    }

    // had to add do this in pgAdmin:
    // GRANT USAGE ON SCHEMA animals TO sqldropbox_admin;
    // GRANT SELECT ON ALL TABLES IN SCHEMA animals TO sqldropbox_admin;
    // GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA animals TO sqldropbox_admin;
}