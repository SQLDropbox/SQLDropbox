using Microsoft.EntityFrameworkCore;
using SQLDropbox.Data;
using SQLDropbox.Enums;
using SQLDropbox.Models;

namespace SQLDropbox.Services
{
    public class AuthorizationService(AppDbContext db)
    {
        private readonly AppDbContext _db = db;

        public async Task UserHasAccessToCourse(Guid? userId, Role? role, Course? course)
        {
            if (userId == null || role == null || course == null) throw new UnauthorizedAccessException();

            bool userHasAccess = false;

            if (role == Role.Admin)
                userHasAccess = true;
            if (role == Role.Lecturer)
                userHasAccess = await _db.Courses.AnyAsync(c => c.CourseId == course.CourseId && c.Lecturers.Any(l => l.UserId == userId));
            if (role == Role.Student)
                userHasAccess = await _db.Courses.AnyAsync(c => c.CourseId == course.CourseId && c.Students.Any(s => s.UserId == userId));

            if (!userHasAccess) throw new UnauthorizedAccessException();
        }

        public async Task UserHasAccessToCourse(Guid? userId, Role? role, string? courseId)
        {
            if (userId == null || role == null || courseId == null) throw new UnauthorizedAccessException();

            bool userHasAccess = false;

            if (role == Role.Admin)
                userHasAccess = true;
            if (role == Role.Lecturer)
                userHasAccess = await _db.Courses.AnyAsync(c => c.CourseId == courseId && c.Lecturers.Any(l => l.UserId == userId));
            if (role == Role.Student)
                userHasAccess = await _db.Courses.AnyAsync(c => c.CourseId == courseId && c.Students.Any(s => s.UserId == userId));

            if (!userHasAccess) throw new UnauthorizedAccessException();
        }

        public async Task UserHasAccessToChapter(Guid? userId, Role? role, Chapter? chapter)
        {
            if (userId == null || role == null || chapter == null) throw new UnauthorizedAccessException();

            bool userHasAccess = false;

            if (role == Role.Admin)
                userHasAccess = true;
            if (role == Role.Lecturer)
                userHasAccess = await _db.Chapters.AnyAsync(c => c.ChapterId == chapter.ChapterId && c.Course.Lecturers.Any(l => l.UserId == userId));
            if (role == Role.Student)
                userHasAccess = await _db.Chapters.AnyAsync(c => c.ChapterId == chapter.ChapterId && c.Course.Students.Any(l => l.UserId == userId));

            if (!userHasAccess) throw new UnauthorizedAccessException();
        }

        public async Task UserHasAccessToChapter(Guid? userId, Role? role, int? chapterId)
        {
            if (userId == null || role == null || chapterId == null) throw new UnauthorizedAccessException();

            bool userHasAccess = false;

            if (role == Role.Admin)
                userHasAccess = true;
            if (role == Role.Lecturer)
                userHasAccess = await _db.Chapters.AnyAsync(c => c.ChapterId == chapterId && c.Course.Lecturers.Any(l => l.UserId == userId));
            if (role == Role.Student)
                userHasAccess = await _db.Chapters.AnyAsync(c => c.ChapterId == chapterId && c.Course.Students.Any(l => l.UserId == userId));

            if (!userHasAccess) throw new UnauthorizedAccessException();
        }
    }
}
