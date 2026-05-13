using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace SQLDropbox.Services
{
    public class SchemaService
    {
        private readonly string _connectionString;

        public SchemaService(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection");
        }

        public async Task<string> CloneSchemaAsync()
        {
            var targetSchema = $"animals_session_{Guid.NewGuid():N}";

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();

            await using var cmd = new NpgsqlCommand(
                "CALL public.sp_clone_schema(@source, @target);",
                conn
            );

            cmd.Parameters.AddWithValue("source", "animals"); // fixed default
            cmd.Parameters.AddWithValue("target", targetSchema);

            await cmd.ExecuteNonQueryAsync();

            return targetSchema;
        }

        public async Task DeleteSchemaAsync(string schemaName)
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