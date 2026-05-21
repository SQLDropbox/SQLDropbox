namespace SQLDropbox.Models
{
    public class RoutineExecuteRequest {
        public string Sql { get; set; } = string.Empty;
        public string? InvokeSql { get; set; }
        public string? TestSql { get; set; }
        public string? VerifySql { get; set; }
    }
}