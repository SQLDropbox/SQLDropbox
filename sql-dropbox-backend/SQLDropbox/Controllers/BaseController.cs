using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.Enums;
using SQLDropbox.Helpers;

namespace SQLDropbox.Controllers
{
    public class BaseController(AppDbContext db) : ControllerBase
    {
        private readonly AppDbContext _db = db;

        protected Guid? GetUserId()
        {
            var result = AuthHelper.GetUserClaims(this);
            if (result.Result != null) return null;
            return (result.Value.id);
        }

        protected Role? GetUserRole()
        {
            var result = AuthHelper.GetUserClaims(this);
            if (result.Result != null) return null;
            return result.Value.role;
        }

        protected(Guid? UserId, Role? Role) IsAuthenticated()
        {
            Guid? userId = GetUserId();
            Role? role = GetUserRole();

            if (userId == null || role == null)
                throw new UnauthorizedAccessException();
            return (userId, role);
        }

        protected async Task UserHasAccessToCourse(string? courseId)
        {
            var (userId, role) = IsAuthenticated();
            if (courseId == null) throw new UnauthorizedAccessException();
            bool userHasAccess = false;

            if (role == Role.Admin || role == Role.Test)
                userHasAccess = true;
            if (role == Role.Lecturer)
                userHasAccess = await _db.Courses.AnyAsync(c => c.CourseId == courseId && c.Lecturers.Any(l => l.UserId == userId));
            if (role == Role.Student)
                userHasAccess = await _db.Courses.AnyAsync(c => c.CourseId == courseId && c.Students.Any(s => s.UserId == userId));

            if (!userHasAccess) throw new UnauthorizedAccessException();  
        }

        protected async Task UserHasAccessToChapter(int? chapterId)
        {
            var (userId, role) = IsAuthenticated();
            if (chapterId == null) throw new UnauthorizedAccessException();
            bool userHasAccess = false;

            if (role == Role.Admin || role == Role.Test)
                userHasAccess = true;
            if (role == Role.Lecturer)
                userHasAccess = await _db.Chapters.AnyAsync(c => c.ChapterId == chapterId && c.Course.Lecturers.Any(l => l.UserId == userId));
            if (role == Role.Student)
                userHasAccess = await _db.Chapters.AnyAsync(c => c.ChapterId == chapterId && c.Course.Students.Any(l => l.UserId == userId));

            if (!userHasAccess) throw new UnauthorizedAccessException();
        }

        protected async Task UserHasAccessToExercise(int? exerciseId)
        {
            var (userId, role) = IsAuthenticated();
            if (exerciseId == null) throw new UnauthorizedAccessException();
            bool userHasAccess = false;

            if (role == Role.Admin || role == Role.Test)
                userHasAccess = true;
            if (role == Role.Lecturer)
                userHasAccess = await _db.Exercises.AnyAsync(e => e.ExerciseId == exerciseId && e.Chapter.Course.Lecturers.Any(l => l.UserId == userId));
            if (role == Role.Student)
                userHasAccess = await _db.Exercises.AnyAsync(e => e.ExerciseId == exerciseId && e.Chapter.Course.Students.Any(l => l.UserId == userId));

            if (!userHasAccess) throw new UnauthorizedAccessException();
        }
    }
}
