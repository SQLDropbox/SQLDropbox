using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.Models;
using SqlParser;
using System.IO.Hashing;
using System.Text;

namespace SQLDropbox.Services
{
    public class SolutionService(AppDbContext db)
    {
        private readonly AppDbContext _db = db;

        public async Task<uint> HashSolution(string query)
        {
            byte[] data = Encoding.UTF8.GetBytes(query);
            uint hash = XxHash32.HashToUInt32(data);
            return hash;
        }

        public (string? FormattedQuery, string? Message) FormatQuery(string query)
        {
            try
            {
                var ast = new SqlQueryParser().Parse(query);
                return (ast.ToSql(), null);
            }
            catch (Exception ex)
            {
                return (null, ex.Message);
            }
        }

        public (bool Valid, string Message) CheckQueryRequirements(List<Requirement> requirements, string formattedQuery)
        {
            foreach (Requirement requirement in requirements)
            {
                bool containsStatement = formattedQuery.Contains(requirement.Statement, StringComparison.CurrentCultureIgnoreCase);

                if (requirement.IsBlacklist && containsStatement)
                {
                    return (false, $"You can't use {requirement.Statement}.");
                }
                if (!requirement.IsBlacklist && !containsStatement)
                {
                    return (false, $"You must use {requirement.Statement}.");
                }
            }
            return (true, "The query is correct.");
        }

        public async Task RegisterUserSolution(
            string formattedQuery,
            Exercise exercise,
            User user,
            string? errorMessage)
        {
            bool isCorrect = errorMessage == null;

            UserExercise? userExercise = await _db.UserExercises
                .Include(ue => ue.UserSolutions)
                .FirstOrDefaultAsync(ue =>
                    ue.Exercise.ExerciseId == exercise.ExerciseId &&
                    ue.User.UserId == user.UserId);

            if (userExercise == null)
            {
                userExercise = new UserExercise
                {
                    IsCompleted = isCorrect,
                    Exercise = exercise,
                    User = user,
                    CreatedAt = DateTime.Now,
                };

                _db.UserExercises.Add(userExercise);
            }
            else
            {
                if (userExercise.IsCompleted)
                    return;

                userExercise.IsCompleted = isCorrect;
                userExercise.UpdatedAt = DateTime.Now;
            }

            userExercise.UserSolutions.Add(new()
            {
                Query = formattedQuery,
                IsCorrect = isCorrect,
                ErrorMessage = errorMessage,
                CreatedAt = DateTime.Now,
            });

            await _db.SaveChangesAsync();
        }
    }
}