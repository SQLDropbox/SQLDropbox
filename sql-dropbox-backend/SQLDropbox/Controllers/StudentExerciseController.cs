using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Models;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class StudentExerciseController(AppDbContext db) : BaseController
{
    private readonly AppDbContext _db = db;

    [HttpPost("submit")]
    public async Task<IActionResult> SubmitSolution([FromBody] SubmitSolutionDTO dto)
    {
        var exercise = await _db.Exercises.Include(e => e.Solutions).FirstOrDefaultAsync(e => e.ExerciseId == dto.ExerciseId);
        var student = await _db.Users.FirstOrDefaultAsync(u => u.UserCode == dto.StudentCode);

        if (exercise == null || student == null)
        {
            return BadRequest(new {message = "Exercise or student not found."});
        }
        var studentExercise = await _db.UserExercises
            .Include(se => se.UserSolutions)
            .FirstOrDefaultAsync(se => se.Exercise.ExerciseId == dto.ExerciseId && se.User.UserCode == dto.StudentCode);
        if (studentExercise == null)
        {
            studentExercise = new UserExercise
            {
                Exercise = exercise,
                User = student,
                IsCompleted = false,
                CreatedAt = DateTime.Now
            };
            await _db.UserExercises.AddAsync(studentExercise);
        }

        bool isCorrect = EvaluateStudentQuery(dto.Query, exercise.Solutions);
        string? errorMessage = isCorrect ? null : "Syntax error or bad result.";

        var newAttempt = new UserSolution
        {
            Query = dto.Query,
            IsCorrect = isCorrect,
            ErrorMessage = errorMessage,
            CreatedAt = DateTime.Now
        };
        studentExercise.UserSolutions.Add(newAttempt);

        if (isCorrect)
        {
            studentExercise.IsCompleted = true;
        }
        studentExercise.UpdatedAt = DateTime.Now;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            isCorrect = newAttempt.IsCorrect,
            error = newAttempt.ErrorMessage,
            isExerciseCompleted = studentExercise.IsCompleted,
        });
    }

    private bool EvaluateStudentQuery(string studentQuery, IEnumerable<Solution> validSolutions)
    {
        if (string.IsNullOrWhiteSpace(studentQuery) || validSolutions == null || !validSolutions.Any())
        {
            return false;
        }
        
        var normalizedStudentQuery = studentQuery.Trim().ToUpperInvariant();

        foreach (var solution in validSolutions)
        {
            var normalizedSolutionQuery = solution.Query.Trim().ToUpperInvariant();

            if (normalizedSolutionQuery == normalizedStudentQuery)
            {
                return true;
            }
        }

        return false;
    }
}