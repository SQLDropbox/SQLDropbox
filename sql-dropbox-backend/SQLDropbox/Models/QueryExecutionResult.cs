namespace SQLDropbox.Models
{
    public class QueryExecutionResult
    {

        public string CommandType { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? TableName { get; set; }
        public string? CsvContent { get; set; }
        public List<string>? Columns { get; set; }
    }
}