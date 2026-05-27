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

        public string FormatQuery(string query)
        {
            var ast = new SqlQueryParser().Parse(query);
            return ast.ToSql();
        }

        public (bool Valid, string Message) CheckQueryRequirements(List<Requirement> requirements, string formattedQuery)
        {
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

        public async Task<string> CreateUserExerciseAndSolutionBasedIfWrongOrRight(string formattedQuery, Exercise exercise, User user)
        {
            //create a user exercise and usersolution based on if the solution given was correct and the errormessage
            UserSolution userSolution = new()
            {
                Query = formattedQuery,
                IsCorrect = false, //true
                ErrorMessage = "",
                CreatedAt = DateTime.UtcNow,
            };

            UserExercise userExercise = new()
            {
                IsCompleted = false, //true
                Exercise = exercise,
                User = user,                
            };

            userExercise.UserSolutions.Add(userSolution);
            //save userexercise and solution          
            return "";
        }
    }
}