using SQLDropbox.Models;
using SqlParser;

namespace SQLDropbox.Services
{
    public class PostgreSQLQueryValidator
    {
        public string ParseQuery(string query)
        {
            var ast = new SqlQueryParser().Parse(query);           
            return ast.ToSql();
        }

        public (bool, string) CheckQueryRequirements(List<Requirement> requirements, string query)
        {
            bool valid = true;
            string message = "";
            string psdQuery = ParseQuery(query);
            foreach (Requirement requirement in requirements)
            {
                if (valid)
                {
                    valid = requirement.Use ?
                        psdQuery.Contains(requirement.Statement) :
                        !psdQuery.Contains(requirement.Statement);
                    message = valid ?
                        "" :
                        $"You {(requirement.Use ? "must" : "can't")} use {requirement.Statement}";
                }
            }
            return (valid, message);
        }
    }
}
