using Npgsql;
using System.Text;

namespace SQLDropbox.Services
{
    public class CsvExportService
    {
        public async Task<string> ExportTableAsync(NpgsqlConnection conn, string tableName)
        {

            var copySql = $@"COPY (SELECT * FROM ""{tableName}"") TO STDOUT WITH (FORMAT CSV, HEADER true)";
            using var reader = conn.BeginTextExport(copySql);
            var sb = new StringBuilder();

            while (true)
            {
                var line = await reader.ReadLineAsync();
                if (line is null) break;

                sb.AppendLine(line);
            }

            return sb.ToString();
        }

        public async Task<string> ExportQueryAsync(NpgsqlConnection conn, string query)
        {
            var copySql = $@"COPY ({query}) TO STDOUT WITH (FORMAT CSV, HEADER true)";
            using var reader = conn.BeginTextExport(copySql);
            var sb = new StringBuilder();

            while (true)
            {
                var line = await reader.ReadLineAsync();
                if (line is null) break;

                sb.AppendLine(line);
            }

            return sb.ToString();
        }

        public async Task<string> ExportValidationQueryAsync(NpgsqlConnection conn, NpgsqlTransaction tx, string query)
        {
            var copySql = $@"COPY ({query}) TO STDOUT WITH (FORMAT CSV, HEADER true)";
            using var reader = conn.BeginTextExport(copySql);
            var sb = new StringBuilder();

            while (true)
            {
                var line = await reader.ReadLineAsync();
                if (line is null) break;

                sb.AppendLine(line);
            }

            return sb.ToString();
        }
    }
}