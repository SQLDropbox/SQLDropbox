using SQLDropbox.Models;
using SqlParser;
using System.IO.Hashing;
using System.Text;

namespace SQLDropbox.Services
{
    public class SolutionService(SchemaService scS)
    {
        private readonly SchemaService _scS = scS;

        public async Task<uint> HashSolution(string query)
        {
            byte[] data = Encoding.UTF8.GetBytes(query);
            uint hash = XxHash32.HashToUInt32(data);
            return hash;
        }

        public async Task<(string FormattedQuery, string QueryOutput, uint QueryHash)> CleanData(string query, string schemaName)
        {
            string formattedQuery = FormatQuery(query);

            string queryOutput = await _scS.ExecuteSelectOnSchemaAsync(schemaName, formattedQuery);           

            uint queryHash = await HashSolution(formattedQuery);

            return (formattedQuery, queryOutput, queryHash);
        }

        public string FormatQuery(string query)
        {
            var ast = new SqlQueryParser().Parse(query);
            return ast.ToSql();
        }

        public (bool Valid, string Message) CheckQueryRequirements(List<Requirement> requirements, string query)
        {
            string formattedQuery = FormatQuery(query);
            foreach (Requirement requirement in requirements)
            {
                if (!requirement.Use ?
                         formattedQuery.Contains(requirement.Statement) :
                         !formattedQuery.Contains(requirement.Statement))
                {
                    return (false, $"You {(requirement.Use ? "must" : "can't")} use {requirement.Statement}.");
                }
            }
            return (true, "The query is correct.");
        }
    }
}