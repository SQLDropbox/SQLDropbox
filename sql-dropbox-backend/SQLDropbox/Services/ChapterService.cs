using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.Models;

namespace SQLDropbox.Services
{
    public class ChapterService(AppDbContext db)
    {
        private readonly AppDbContext _db = db;

        public async Task<(bool Succes, string? Message)> AssignExercisesForChapterToUser(User user, int chapterId)
        {
            Chapter? chapter = await _db.Chapters
                  .Where(c => c.ChapterId == chapterId)
                  .Include(c => c.Exercises
                      .OrderBy(e => e.ExerciseId)
                  )
                  .ThenInclude(e => e.UserExercises
                    .Where(ue => ue.User == user)
                  )
                  .FirstOrDefaultAsync();

            if (chapter == null)
                return (false, $"Chapter with ID {chapterId} not found.");

            int amount = chapter.AmountOfExercises ?? 0;

            List<Exercise> currentExercises = [.. chapter.Exercises
                    .Where(e => e.UserExercises.Any(se => se.User == user))
                    .OrderBy(e => e.ExerciseId)];

            if (currentExercises.Count >= amount)
                return (true, null);

            int amountNeeded = amount - currentExercises.Count;

            List<Exercise> possibleExercises = [.. chapter.Exercises
                    .Where(e => !e.UserExercises.Any(se => se.User == user))
                    .OrderBy(e => e.ExerciseId)];

            List<UserExercise> userExercises = [];

            for (int i = 0; i < amount; i++)
            {
                if (amountNeeded == 0 || possibleExercises.Count == 0)
                    break;

                int random = Random.Shared.Next(possibleExercises.Count);
                Exercise randomExercise = possibleExercises[random];

                if (randomExercise == null)
                    return (false, "Error occured selecting a random exercise.");

                userExercises.Add(new UserExercise
                {
                    IsCompleted = false,
                    Exercise = randomExercise,
                    User = user,
                    CreatedAt = DateTime.Now,
                });

                amountNeeded--;
                possibleExercises.RemoveAll(e => e.ExerciseId == randomExercise.ExerciseId);
            }

            _db.UserExercises.AddRange(userExercises);
            await _db.SaveChangesAsync();

            return (true, null);
        }
    }
}
