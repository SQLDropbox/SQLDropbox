using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.Enums;
using SQLDropbox.Models;

namespace SQLDropbox.Services
{
    public class RandomExerciseSelectorService(AppDbContext db)
    {
        private readonly AppDbContext _db = db;

        public async Task<(Exercise? Exercise, string? Message)> GetRandomExerciseForChapter(int chapterId, Guid? userId)
        {
            if (chapterId <= 0)
                return (null, "Chapter doesn't exist.");
            if (userId == null)
                return (null, "User id is required.");

            List<Exercise> exercises = await _db.Exercises               
                .Where(e => e.DeletedAt == null &&
                    !e.UserExercises.Any(se =>
                        se.User.UserId == userId)
                )
                .OrderBy(e => e.ExerciseId)
                .ToListAsync();

            int amountOfExercisesInChapter = exercises.Count;
            if (amountOfExercisesInChapter <= 0)
                return (null, "No new exercise left for this chapter.");

            int random = Random.Shared.Next(amountOfExercisesInChapter);
            Exercise randomExercise = exercises[random];

            if(randomExercise == null)
                return (null, "Error occured selecting a random exercise.");

            return (randomExercise, null);
        }
    }
}
