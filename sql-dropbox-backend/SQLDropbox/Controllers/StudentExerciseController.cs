using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Models;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class StudentExerciseController : ControllerBase
{
    private readonly AppDbContext _db;
    public StudentExerciseController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("submit")]
    public async Task<IActionResult> SubmitSolution([FromBody] SubmitSolutionDTO dto)
    {
        var exercise = await _db.Exercises.Include(e => e.Solutions).FirstOrDefaultAsync(e => e.ExerciseId == dto.ExerciseId);
        var student = await _db.Students.FirstOrDefaultAsync(s => s.StudentCode == dto.StudentCode);

        if (exercise == null || student == null)
        {
            return BadRequest(new {message = "Exercise or student not found."});
        }
        var studentExercise = await _db.StudentExercises
            .Include(se => se.StudentSolutions)
            .FirstOrDefaultAsync(se => se.Exercise.ExerciseId == dto.ExerciseId && se.Student.StudentCode == dto.StudentCode);
        if (studentExercise == null)
        {
            studentExercise = new StudentExercise
            {
                Exercise = exercise,
                Student = student,
                IsCompleted = false,
                CreatedAt = DateTime.Now
            };
            await _db.StudentExercises.AddAsync(studentExercise);
        }

        bool isCorrect = EvaluateStudentQuery(dto.Query, exercise.Solutions);
        string? errorMessage = isCorrect ? null : "Syntax error or bad result.";

        var newAttempt = new StudentSolution
        {
            Query = dto.Query,
            IsCorrect = isCorrect,
            Error = errorMessage,
            CreatedAt = DateTime.Now
        };
        studentExercise.StudentSolutions.Add(newAttempt);

        if (isCorrect)
        {
            studentExercise.IsCompleted = true;
        }
        studentExercise.UpdatedAt = DateTime.Now;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            isCorrect = newAttempt.IsCorrect,
            error = newAttempt.Error,
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