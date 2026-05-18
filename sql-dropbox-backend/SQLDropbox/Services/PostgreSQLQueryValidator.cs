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

        public bool CheckQueryRequirements(List<Requirement> requirements, string query)
        {
            bool valid = true;
            string psdQuery = ParseQuery(query);
            foreach (Requirement requirement in requirements)
            {
                if (valid)
                {
                    valid = requirement.Use ?
                        psdQuery.Contains(requirement.Statement) :
                        !psdQuery.Contains(requirement.Statement);
                }               
            }
            return valid;
        }
    }
}
