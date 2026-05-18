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

        public (bool Valid, string Message) CheckQueryRequirements(List<Requirement> requirements, string query)
        {
            string psdQuery = ParseQuery(query);
            foreach (Requirement requirement in requirements)
            {
                if(!requirement.Use ?
                         psdQuery.Contains(requirement.Statement) :
                         !psdQuery.Contains(requirement.Statement))
                {
                    return (false, $"You {(requirement.Use ? "must" : "can't")} use {requirement.Statement}.");
                }
            }
            return (true, "The query is correct.");
        }
    }
}
