using SqlParser;

namespace SQLDropbox.Services
{
    public class PostgreSQLQueryFormatter
    {
        public string ParseSQL(string query)
        {
            var ast = new SqlQueryParser().Parse(query);           
            return ast.ToSql();
        }
    }
}
