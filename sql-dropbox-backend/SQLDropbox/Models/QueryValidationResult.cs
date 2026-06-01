namespace SQLDropbox.Models
{
    public class QueryValidationResult
    {

        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? NormalizedQuery { get; set; }

        public static QueryValidationResult Success(string normalizedQuery)
        {
            return new QueryValidationResult
            {
                IsValid = true,
                Message = string.Empty,
                NormalizedQuery = normalizedQuery
            };
        }

        public static QueryValidationResult Fail(string message)
        {
            return new QueryValidationResult
            {
                IsValid = false,
                Message = message,
                NormalizedQuery = null
            };
        }
    }
}