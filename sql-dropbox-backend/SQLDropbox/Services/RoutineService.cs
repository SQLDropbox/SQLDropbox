using Microsoft.Extensions.Configuration;
using Npgsql;
using SQLDropbox.Models;
using System.Text.RegularExpressions;

namespace SQLDropbox.Services
{
    public class RoutineService
    {
        private readonly string _connectionString;
        private readonly SqlQueryService _sql;

        public RoutineService(IConfiguration config, SqlQueryService sql)
        {
            _connectionString = config.GetConnectionString("DefaultConnection")!;
            _sql = sql;
        }

        private async Task<NpgsqlConnection> OpenConnectionAsync()
        {
            var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();
            return conn;
        }

        private static string StripSemicolon(string sql)
        {
            sql = sql.Trim();
            return sql.EndsWith(";") ? sql[..^1] : sql;
        }

        public async Task<object?> ExecuteRoutineAsync(
            string schema,
            string sql,
            string? setupSql = null,
            string? invokeSql = null,
            string? testSql = null,
            string? verifySql = null)
        {
            await using var conn = await OpenConnectionAsync();
            await using var tx = await conn.BeginTransactionAsync();

            await using (var setPath = new NpgsqlCommand(
                $"SET LOCAL search_path TO \"{schema}\";", conn, tx))
            {
                await setPath.ExecuteNonQueryAsync();
            }

            // 1. CREATE FUNCTION / ROUTINE
            sql = StripSemicolon(sql);

            await using (var createCmd = new NpgsqlCommand(sql, conn, tx))
            {
                await createCmd.ExecuteNonQueryAsync();
            }

            // 2. CREATE TRIGGER (NEW)
            if (!string.IsNullOrWhiteSpace(setupSql))
            {
                setupSql = StripSemicolon(setupSql);

                var setupValidation = _sql.Validate(setupSql);
                if (!setupValidation.IsValid)
                    throw new InvalidOperationException(setupValidation.Message);

                await using var setupCmd = new NpgsqlCommand(
                    setupValidation.NormalizedQuery!, conn, tx);

                await setupCmd.ExecuteNonQueryAsync();
            }

            // 3. INVOKE ROUTINE
            if (!string.IsNullOrWhiteSpace(invokeSql))
            {
                var invokeValidation = _sql.ValidateRoutineInvocation(invokeSql);
                if (!invokeValidation.IsValid)
                    throw new InvalidOperationException(invokeValidation.Message);

                var finalInvokeSql = StripSemicolon(invokeValidation.NormalizedQuery!);

                await using var invokeCmd = new NpgsqlCommand(finalInvokeSql, conn, tx);
                await using var reader = await invokeCmd.ExecuteReaderAsync();

                var rows = new List<Dictionary<string, object?>>();

                while (await reader.ReadAsync())
                {
                    var row = new Dictionary<string, object?>();

                    for (int i = 0; i < reader.FieldCount; i++)
                        row[reader.GetName(i)] =
                            await reader.IsDBNullAsync(i)
                                ? null
                                : reader.GetValue(i);

                    rows.Add(row);
                }

                await reader.CloseAsync();
                await tx.CommitAsync();

                if (rows.Count == 1 && rows[0].Count == 1)
                    return rows[0].First().Value;

                return rows;
            }

            // 4. TEST (TRIGGER FIRING STEP)
            if (!string.IsNullOrWhiteSpace(testSql))
            {
                var testValidation = _sql.ValidateTriggerTestQuery(testSql);
                if (!testValidation.IsValid)
                    throw new InvalidOperationException(testValidation.Message);

                var finalTestSql = StripSemicolon(testValidation.NormalizedQuery!);

                await using var testCmd = new NpgsqlCommand(finalTestSql, conn, tx);
                await testCmd.ExecuteNonQueryAsync();
            }

            // 5. VERIFY
            if (!string.IsNullOrWhiteSpace(verifySql))
            {
                var verifyValidation = _sql.ValidateReadOnlyQuery(verifySql);
                if (!verifyValidation.IsValid)
                    throw new InvalidOperationException(verifyValidation.Message);

                var finalVerifySql = StripSemicolon(verifyValidation.NormalizedQuery!);

                await using var verifyCmd = new NpgsqlCommand(finalVerifySql, conn, tx);
                await using var reader = await verifyCmd.ExecuteReaderAsync();

                var rows = new List<Dictionary<string, object?>>();

                while (await reader.ReadAsync())
                {
                    var row = new Dictionary<string, object?>();

                    for (int i = 0; i < reader.FieldCount; i++)
                        row[reader.GetName(i)] =
                            await reader.IsDBNullAsync(i)
                                ? null
                                : reader.GetValue(i);

                    rows.Add(row);
                }

                await reader.CloseAsync();
                await tx.CommitAsync();

                if (rows.Count == 1 && rows[0].Count == 1)
                    return rows[0].First().Value;

                return rows;
            }

            await tx.CommitAsync();

            return new
            {
                message = "Routine executed successfully"
            };
        }
    }
}