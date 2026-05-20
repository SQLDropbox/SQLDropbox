using SQLDropbox.Models;
using System.Text.RegularExpressions;

namespace SQLDropbox.Services
{
    public class SqlQueryService
    {
        public bool IsProtectedSchema(string schema){
            
            if (string.IsNullOrWhiteSpace(schema)) return true;

            schema = schema.Trim().ToLowerInvariant();

            var forbidden = new[]
            {
                "util",
                "public",
                "pg_catalog",
                "information_schema"
            };

            return forbidden.Contains(schema);
        }

        public QueryValidationResult Validate(string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return QueryValidationResult.Fail("Query is required.");

            var trimmed = query.Trim();

            if (trimmed.Count(c => c == ';') > 1 || (trimmed.Contains(';') && !trimmed.TrimEnd().EndsWith(";")))
            {
                return QueryValidationResult.Fail("Only a single SQL statement is allowed.");
            }

            if (trimmed.EndsWith(";")) trimmed = trimmed[..^1].Trim();

            var forbiddenPatterns = new[]
            {
                "GRANT ", "REVOKE ", "ALTER ROLE ", "CREATE ROLE ",
                "DROP ROLE ", "CREATE USER ", "ALTER USER ",
                "DROP USER ", "SET ROLE ", "RESET ROLE ",
                "SECURITY LABEL "
            };

            if (forbiddenPatterns.Any(x => trimmed.Contains(x, StringComparison.OrdinalIgnoreCase)))
            {
                return QueryValidationResult.Fail("Queries that change database privileges or roles are not allowed.");
            }

            var allowedStarts = new[]
            {
                "SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "ALTER", "DROP"
            };

            if (!allowedStarts.Any(x => trimmed.StartsWith(x, StringComparison.OrdinalIgnoreCase)))
            {
                return QueryValidationResult.Fail("Only SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, and DROP statements are allowed.");
            }

            var forbiddenSchemas = new[]
            {
                "util.", "public.", "pg_catalog.", "information_schema."
            };

            if (forbiddenSchemas.Any(x => trimmed.Contains(x, StringComparison.OrdinalIgnoreCase)))
            {
                return QueryValidationResult.Fail("Referencing protected schemas is not allowed.");
            }

            return QueryValidationResult.Success(trimmed);
        }

        public string GetCommandType(string sql)
        {
            var firstWord = sql.TrimStart().Split(' ', '\n', '\r', '\t')[0];

            return firstWord?.ToUpperInvariant() ?? string.Empty;
        }

        public string? ExtractTableName(string sql, string commandType)
        {
            var normalized = sql.Trim();

            return commandType switch
            {
                "INSERT" => Regex.Match(normalized,
                    @"INSERT\s+INTO\s+([a-zA-Z_][a-zA-Z0-9_]*)",
                    RegexOptions.IgnoreCase).Groups[1].Value,

                "UPDATE" => Regex.Match(normalized,
                    @"UPDATE\s+([a-zA-Z_][a-zA-Z0-9_]*)",
                    RegexOptions.IgnoreCase).Groups[1].Value,

                "DELETE" => Regex.Match(normalized,
                    @"DELETE\s+FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)",
                    RegexOptions.IgnoreCase).Groups[1].Value,

                "ALTER" => Regex.Match(normalized,
                    @"ALTER\s+TABLE\s+([a-zA-Z_][a-zA-Z0-9_]*)",
                    RegexOptions.IgnoreCase).Groups[1].Value,

                "DROP" => Regex.Match(normalized,
                    @"DROP\s+TABLE\s+([a-zA-Z_][a-zA-Z0-9_]*)",
                    RegexOptions.IgnoreCase).Groups[1].Value,

                "CREATE" => Regex.Match(normalized,
                    @"CREATE\s+TABLE\s+([a-zA-Z_][a-zA-Z0-9_]*)",
                    RegexOptions.IgnoreCase).Groups[1].Value,

                _ => null
            };
        }

        public bool IsSafeSelectQuery(string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return false;

            var trimmed = query.Trim();

            if (trimmed.EndsWith(";")) trimmed = trimmed[..^1].Trim();
            if (!trimmed.StartsWith("SELECT", StringComparison.OrdinalIgnoreCase)) return false;
            if (trimmed.Contains("--") ||
                trimmed.Contains("/*") ||
                trimmed.Contains("*/"))
                return false;

            var forbidden = new[]
            {
                "INSERT ", "UPDATE ", "DELETE ", "DROP ",
                "ALTER ", "CREATE ", "TRUNCATE ", "CALL ",
                "DO ", "COPY ", "GRANT ", "REVOKE "
            };

            return !forbidden.Any(x => trimmed.Contains(x, StringComparison.OrdinalIgnoreCase));
        }
    }
}