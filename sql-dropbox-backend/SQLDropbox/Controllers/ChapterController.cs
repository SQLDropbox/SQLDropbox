using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.DTO;
using SQLDropbox.Models;
using SQLDropbox.Services;

namespace SQLDropbox.Controllers;

[ApiController]
[Route("[controller]")]
public class ChapterController(AppDbContext db, AuthorizationService authorizationService, ChapterService chapterService) : BaseController
{
    private readonly AppDbContext _db = db;
    private readonly AuthorizationService _aS = authorizationService;
    private readonly ChapterService _cS = chapterService;
    private string BaseUrl => $"{Request.Scheme}://{Request.Host}";

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetChapters()
    {
        try
        {
            var chapters = _db.Chapters
            .OrderBy(x => x.Order)
            .Select(x => new
            {
                x.ChapterId,
                x.ChapterNameNL,
                x.ChapterNameEN,
                x.ChapterDescriptionNL,
                x.ChapterDescriptionEN,
                x.AmountOfExercises,
                x.Order,
                x.Schema.SchemaId,
                x.Schema.SchemaName,
                x.Course.CourseId,
                SchemaImage = string.IsNullOrEmpty(x.Schema.SchemaImage) ? null : $"{BaseUrl}/schema-images/{x.Schema.SchemaImage}",
            }).ToList();
            return Ok(chapters);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "You're not authorized to access this resource." });
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult> GetChapterByChapterId(int id)
    {
        try
        {
            var (userId, role) = IsAuthenticated();
            await _aS.UserHasAccessToChapter(userId, role, id);

            var chapter = await _db.Chapters.Where(x => x.ChapterId == id).Select(x => new
            {
                x.ChapterId,
                x.ChapterNameNL,
                x.ChapterNameEN,
                x.ChapterDescriptionNL,
                x.ChapterDescriptionEN,
                x.AmountOfExercises,
                x.CreatedAt,

                Schema = new
                {
                    x.Schema.SchemaId,
                    x.Schema.SchemaName,
                    SchemaImage = string.IsNullOrEmpty(x.Schema.SchemaImage) ? null : $"{BaseUrl}/schema-images/{x.Schema.SchemaImage}",
                }

            }).FirstOrDefaultAsync();
            if (chapter == null)
            {
                return NotFound(new { message = $"Chapter with ID {id} not found." });
            }

            return Ok(chapter);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "You're not authorized to access this resource." });
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [Authorize(Roles = "Admin,Lecturer")]
    [HttpPost("course/{courseId}")]
    public async Task<ActionResult> CreateChapter(string courseId, [FromBody] ChapterDTO dto)
    {
        try
        {
            var (userId, role) = IsAuthenticated();
            await _aS.UserHasAccessToCourse(userId, role, courseId);

            Course? course = await _db.Courses.FirstOrDefaultAsync(x => x.CourseId == courseId);

            if (course == null)
                return NotFound(new { message = "Course not found." });

            Schema? schema = await _db.Schemas.FirstOrDefaultAsync(x => x.SchemaId == dto.SchemaId);

            if (schema == null)
                return BadRequest(new { message = "Schema not found." });

            var maxOrder = await _db.Chapters.Where(c => c.Course.CourseId == courseId).MaxAsync(c => c.Order);

            int nextOrder = (maxOrder ?? -1) + 1;

            var newChapter = new Chapter
            {
                ChapterNameNL = dto.ChapterNameNL,
                ChapterNameEN = dto.ChapterNameEN,
                ChapterDescriptionNL = dto.ChapterDescriptionNL,
                ChapterDescriptionEN = dto.ChapterDescriptionEN,
                AmountOfExercises = dto.AmountOfExercises,
                Order = nextOrder,
                Course = course,
                Schema = schema,
                CreatedAt = DateTime.UtcNow
            };

            _db.Chapters.Add(newChapter);
            await _db.SaveChangesAsync();

            return Ok(newChapter);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "You're not authorized to access this resource." });
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [Authorize(Roles = "Admin,Lecturer")]
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateChapter(int id, [FromBody] UpdateChapterDTO dto)
    {
        try
        {
            var (userId, role) = IsAuthenticated();
            await _aS.UserHasAccessToChapter(userId, role, id);

            Chapter? chapter = await _db.Chapters.Include(c => c.Course).FirstOrDefaultAsync(x => x.ChapterId == id);
            if (chapter == null)
                return NotFound(new { message = $"Chapter not found." });

            if (dto.ChapterNameNL != null) chapter.ChapterNameNL = dto.ChapterNameNL;
            if (dto.ChapterNameEN != null) chapter.ChapterNameEN = dto.ChapterNameEN;
            if (dto.ChapterDescriptionNL != null) chapter.ChapterDescriptionNL = dto.ChapterDescriptionNL;
            if (dto.ChapterDescriptionEN != null) chapter.ChapterDescriptionEN = dto.ChapterDescriptionEN;
            if (dto.AmountOfExercises.HasValue) chapter.AmountOfExercises = dto.AmountOfExercises.Value;

            if (dto.SchemaId.HasValue)
            {
                Schema? schema = await _db.Schemas.FirstOrDefaultAsync(x => x.SchemaId == dto.SchemaId.Value);

                if (schema == null)
                    return NotFound(new { message = "Schema not found." });

                chapter.Schema = schema;
            }

            chapter.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return Ok(chapter);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "You're not authorized to access this resource." });
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [Authorize(Roles = "Admin,Lecturer")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteChapter(int id)
    {
        try
        {
            var (userId, role) = IsAuthenticated();
            await _aS.UserHasAccessToChapter(userId, role, id);

            Chapter? chapter = await _db.Chapters.FirstOrDefaultAsync(x => x.ChapterId == id);

            if (chapter == null)
                return NotFound(new { message = "Chapter not found." });

            chapter.DeletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return Ok(new { message = $"Chapter with ID {id} successfully deleted." });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "You're not authorized to access this resource." });
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    //[Authorize]
    //[HttpGet("{chapterId}/exercises-old")]
    //public async Task<ActionResult<IEnumerable<Exercise>>> GetExercisesByChapterOld(int chapterId)
    //{
    //    try
    //    {
    //        var (userId, role) = IsAuthenticated();

    //        if (role == Role.Student)
    //        {
    //            await _aS.UserHasAccessToChapter(userId, role, chapterId);

    //            User? student = await _db.Users
    //                .Where(u => u.UserId == userId)
    //                .FirstOrDefaultAsync();

    //            if (student == null)
    //                return NotFound("Student not found.");

    //            Chapter? chapterForStudent = await _db.Chapters
    //              .Where(c => c.ChapterId == chapterId)
    //              .Include(c => c.Exercises
    //                  .OrderBy(e => e.ExerciseId)
    //              )
    //              .ThenInclude(e => e.UserExercises
    //                .Where(ue => ue.User == student)
    //              )
    //              .FirstOrDefaultAsync();

    //            if (chapterForStudent == null)
    //                return BadRequest(new { message = $"Chapter with ID {chapterId} not found." });

    //            int amount = chapterForStudent.AmountOfExercises ?? 0;

    //            List<Exercise> currentExercises = [.. chapterForStudent.Exercises
    //                .Where(e => e.UserExercises.Any(se => se.User == student))
    //                .OrderBy(e => e.ExerciseId)];

    //            if (currentExercises.Count == amount)
    //                return Ok(currentExercises);

    //            List<Exercise> possibleExercises = [.. chapterForStudent.Exercises
    //                .Where(e => !e.UserExercises.Any(se => se.User == student))
    //                .OrderBy(e => e.ExerciseId)];

    //            List<Exercise> exercises = currentExercises;
    //            List<UserExercise> userExercises = [];

    //            for (int i = 0; i < amount; i++)
    //            {
    //                if (possibleExercises.Count == 0)
    //                    return BadRequest(new { message = "No possible exercise left for this chapter." });

    //                int random = Random.Shared.Next(possibleExercises.Count);
    //                Exercise randomExercise = possibleExercises[random];

    //                if (randomExercise == null)
    //                    return BadRequest(new { message = "Error occured selecting a random exercise." });

    //                userExercises.Add(new UserExercise
    //                {
    //                    IsCompleted = false,
    //                    Exercise = randomExercise,
    //                    User = student,
    //                    CreatedAt = DateTime.UtcNow,
    //                });

    //                exercises.Add(randomExercise);
    //                possibleExercises.RemoveAll(e => e.ExerciseId == randomExercise.ExerciseId);
    //            }

    //            _db.UserExercises.AddRange(userExercises);
    //            await _db.SaveChangesAsync();

    //            return Ok(exercises);
    //        }

    //        if (role == Role.Lecturer)
    //        {
    //            bool lecturerHasAccess = await _db.Chapters.AnyAsync(c => c.ChapterId == chapterId && c.Course.Lecturers.Any(l => l.UserId == userId));

    //            if (!lecturerHasAccess)
    //                return Unauthorized(new { message = "You're not registerd as a lecturer for this course." });
    //        }

    //        Chapter? chapter = await _db.Chapters
    //            .Where(c => c.ChapterId == chapterId)
    //            .Include(c => c.Exercises)
    //                .ThenInclude(e => e.Requirements)
    //            .Include(c => c.Exercises)
    //                .ThenInclude(e => e.Solutions)
    //            .FirstOrDefaultAsync();

    //        if (chapter == null)
    //            return NotFound(new { message = "Chapter not found." });

    //        return Ok(chapter.Exercises);
    //    }
    //    catch (UnauthorizedAccessException)
    //    {
    //        return Unauthorized(new { message = "You're not authorized to access this resource." });
    //    }
    //    catch (Exception ex)
    //    {
    //        return BadRequest(ex);
    //    }
    //}

    [Authorize]
    [HttpGet("{chapterId}/exercises")]
    public async Task<IActionResult> GetRandomExercisesByChapter(int chapterId)
    {
        try
        {
            var (userId, role) = IsAuthenticated();
            await _aS.UserHasAccessToChapter(userId, role, chapterId);

            User? user = await _db.Users
                    .Where(u => u.UserId == userId)
                    .FirstOrDefaultAsync();

            if (user == null)
                return NotFound("User not found.");

            var (success, message) = await _cS.AssignExercisesForChapterToUser(user, chapterId);
            if (!success)
                return BadRequest(new { message });

            var chapter = await _db.Chapters
                .Where(c => c.ChapterId == chapterId)
                .Select(c => new
                {
                    c.ChapterId,
                    c.ChapterNameEN,
                    c.ChapterNameNL,
                    c.ChapterDescriptionEN,
                    c.ChapterDescriptionNL,
                    c.AmountOfExercises,
                    c.Order,
                    c.Deadline,

                    Exercises = c.Exercises
                        .Where(e => e.UserExercises.Any(ue => ue.User == user))
                        .Select(e => new
                        {
                            e.ExerciseId,
                            e.QuestionNL,
                            e.QuestionEN,
                            e.HintNL,
                            e.HintEN,
                            e.QueryOutput,
                            e.QueryAction,

                            Requirements = e.Requirements
                                .Select(r => new
                                {
                                    r.Statement,
                                    r.Use
                                })
                                .ToList(),

                            UserExercises = e.UserExercises
                                .Where(ue => ue.User == user)
                                .Select(ue => new
                                {
                                    ue.UserExerciseId,
                                    ue.IsCompleted,

                                    UserSolutions = ue.UserSolutions
                                        .Select(us => new
                                        {
                                            us.UserSolutionId,
                                            us.Query,
                                            us.IsCorrect,
                                            us.ErrorMessage
                                        })
                                        .ToList()
                                })
                                .ToList()
                        })
                        .ToList(),

                    Schema = new
                    {
                        c.Schema.SchemaId,
                        c.Schema.SchemaName,
                        c.Schema.SchemaImage
                    }
                })
                .FirstOrDefaultAsync();

            if (chapter == null)
                return NotFound(new { message = "Chapter not found." });

            return Ok(chapter);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "You're not authorized to access this resource." });
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [Authorize(Roles = "Admin,Lecturer")]
    [HttpGet("{chapterId}/all-exercises")]
    public async Task<IActionResult> GetAllExercisesByChapter(int chapterId)
    {
        try
        {
            var (userId, role) = IsAuthenticated();
            await _aS.UserHasAccessToChapter(userId, role, chapterId);

            User? user = await _db.Users
                    .Where(u => u.UserId == userId)
                    .FirstOrDefaultAsync();

            if (user == null)
                return NotFound("User not found.");           

            var chapter = await _db.Chapters
                .Where(c => c.ChapterId == chapterId)
                .Select(c => new
                {
                    c.ChapterId,
                    c.ChapterNameEN,
                    c.ChapterNameNL,
                    c.ChapterDescriptionEN,
                    c.ChapterDescriptionNL,
                    c.AmountOfExercises,
                    c.Order,
                    c.Deadline,

                    Exercises = c.Exercises
                        .Select(e => new
                        {
                            e.ExerciseId,
                            e.QuestionNL,
                            e.QuestionEN,
                            e.HintNL,
                            e.HintEN,
                            e.QueryOutput,
                            e.QueryAction,

                            Requirements = e.Requirements
                                .Select(r => new
                                {
                                    r.Statement,
                                    r.Use
                                })
                                .ToList(),                           
                        })
                        .ToList(),

                    Schema = new
                    {
                        c.Schema.SchemaId,
                        c.Schema.SchemaName,
                        c.Schema.SchemaImage
                    }
                })
                .FirstOrDefaultAsync();

            if (chapter == null)
                return NotFound(new { message = "Chapter not found." });

            return Ok(chapter);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "You're not authorized to access this resource." });
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [Authorize(Roles = "Admin,Lecturer")]
    [HttpPost("course/{courseId}/reorder")]
    public async Task<ActionResult> ReorderChapter(string courseId, [FromBody] ReorderChaptersDTO dto)
    {
        try
        {
            var (userId, role) = IsAuthenticated();
            await _aS.UserHasAccessToCourse(userId, role, courseId);

            List<Chapter> chapters = await _db.Chapters.Where(c => c.Course.CourseId == courseId).ToListAsync();

            if (chapters.Count == 0)
                return NotFound(new { message = "Chapter not found." });

            for (int i = 0; i < dto.OrderedIds.Count; i++)
            {
                if (int.TryParse(dto.OrderedIds[i], out int chapterId))
                {
                    var chapterToUpdate = chapters.FirstOrDefault(c => c.ChapterId == chapterId);

                    if (chapterToUpdate != null)
                    {
                        chapterToUpdate.Order = i;
                        chapterToUpdate.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }
            await _db.SaveChangesAsync();

            return Ok(chapters);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "You're not authorized to access this resource." });
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }
}