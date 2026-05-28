using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.Models;
using SqlParser;
using System.IO.Hashing;
using System.Text;

namespace SQLDropbox.Services
{
    public class SolutionService(AppDbContext db, SchemaService scS)
    {
        private readonly AppDbContext _db = db;
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

        public async Task RegisterUserSolution(string formattedQuery, Exercise exercise, User user, string? errorMessage)
        {
            UserExercise? userExercise = await _db.UserExercises.FirstOrDefaultAsync(ue => ue.Exercise == exercise && ue.User == user);
            if (userExercise == null)
            {
                userExercise = new UserExercise()
                {
                    IsCompleted = errorMessage == null,
                    Exercise = exercise,
                    User = user,
                    CreatedAt = DateTime.Now,
                };
            }
            else
            {
                if (userExercise.IsCompleted) return;
                userExercise.UpdatedAt = DateTime.UtcNow;
            }

            UserSolution userSolution = new()
            {
                Query = formattedQuery,
                IsCorrect = errorMessage == null,
                ErrorMessage = errorMessage,
                CreatedAt = DateTime.UtcNow,
            };

            userExercise.UserSolutions.Add(userSolution);

            if (userExercise.UpdatedAt == null)
            {
                _db.UserExercises.Add(userExercise);
            }
            else
            {
                _db.UserExercises.Update(userExercise);
            }

            await _db.SaveChangesAsync();
            return;
        }
    }
}